import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";

function formatCompact(value) {
    if (typeof value !== "number") value = parseFloat(value);
    if (isNaN(value)) return "-";
    const absVal = Math.abs(value);
    if (absVal >= 1e9) return (value / 1e9).toFixed(2) + "B";
    if (absVal >= 1e6) return (value / 1e6).toFixed(2) + "M";
    if (absVal >= 1e3) return (value / 1e3).toFixed(2) + "K";
    if (absVal > 0 && absVal < 0.01) return value.toExponential(2);
    return value.toFixed(2);
}

const renderWithTooltip = (value) => {
    const parsed = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(parsed)) return "-";
    return (
        <div className="relative group cursor-pointer w-max" tabIndex={0}>
            <span>{formatCompact(parsed)}</span>
            <div className="absolute z-10 hidden group-hover:block group-focus:block bg-black text-white text-xs p-1 rounded top-full mt-1 whitespace-nowrap">
                {parsed.toLocaleString(undefined, { maximumFractionDigits: 8 })}
            </div>
        </div>
    );
};

const KoinXLogo = () => {
    return (
        <div className="bg-[#0F111D] p-2 flex items-center justify-start">
            <h1 className="text-lg font-bold">
                <span className="text-blue-600">Koin</span>
                <span className="text-yellow-500">X</span>
                <sup className="text-white text-xs align-top ml-[1px]">®</sup>
            </h1>
        </div>
    );
};

export default function TaxHarvestingDashboard() {
    const [holdings, setHoldings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDisclaimers, setShowDisclaimers] = useState(true);
    const [showTooltip, setShowTooltip] = useState(false);
    const [viewAll, setViewAll] = useState(false);
    const [summary, setSummary] = useState(null);

    const calculateSummary = (data) => {
        const initialShortTerm = {
            profit: 70200.88,
            loss: -1548.53,
        };
        const initialLongTerm = {
            profit: 5020,
            loss: -3050,
        };

        const shortTerm = { ...initialShortTerm };
        const longTerm = { ...initialLongTerm };

        for (const h of data) {
            const stcg = h.stcg.balance;
            const ltcg = h.ltcg.balance;

            if (stcg > 0) shortTerm.profit += stcg;
            if (stcg < 0) shortTerm.loss += stcg;

            if (ltcg > 0) longTerm.profit += ltcg;
            if (ltcg < 0) longTerm.loss += ltcg;
        }

        const realisedGains =
            shortTerm.profit + shortTerm.loss + longTerm.profit + longTerm.loss;
        const simulatedShortLoss = shortTerm.loss * 3;
        const simulatedLongLoss = longTerm.loss * 5;
        const effectiveGains =
            shortTerm.profit +
            simulatedShortLoss +
            longTerm.profit +
            simulatedLongLoss;
        const savings =
            realisedGains > effectiveGains ? realisedGains - effectiveGains : 0;

        return {
            shortTerm,
            longTerm,
            realisedGains,
            effectiveGains,
            savings,
        };
    };

    useEffect(() => {
        setSummary(calculateSummary([]));
    }, []);

    useEffect(() => {
        axios
            .get("https://run.mocky.io/v3/87989ee6-5f63-4b39-b284-c275a3649e4c")
            .then((res) => {
                setHoldings(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to fetch holdings data.");
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const selectedHoldings = holdings.filter((h) => h.selected);
        setSummary(calculateSummary(selectedHoldings));
    }, [holdings]);

    const toggleSelection = (coin) => {
        const updated = holdings.map((h) =>
            h.coin === coin ? { ...h, selected: !h.selected } : h
        );
        setHoldings(updated);
    };

    const columns = [
        {
            name: "Asset",
            selector: (row) => row.coin,
            sortable: true,
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={row.selected || false}
                        onChange={() => toggleSelection(row.coin)}
                    />
                    <img src={row.logo} alt={row.coin} className="w-5 h-5" />
                    <div>
                        <div className="font-semibold text-white">
                            {row.coin}
                        </div>
                        <div className="text-xs text-gray-400">
                            {row.coinName}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            name: "Holdings",
            selector: (row) => parseFloat(row.holdings),
            sortable: true,
            cell: (row) => (
                <div>
                    <div className="text-white">
                        {renderWithTooltip(row.averageBuyPrice)}
                    </div>
                    <div className="text-xs text-gray-400">
                        {row.currentPrice}
                    </div>
                </div>
            ),
        },
        {
            name: "Total Current Value",
            selector: (row) => parseFloat(row.totalHolding),
            sortable: true,
            cell: (row) => (
                <div className="text-white">
                    {renderWithTooltip(row.totalHolding)}
                </div>
            ),
        },
        {
            name: "Short-term",
            selector: (row) => parseFloat(row.stcg.balance),
            sortable: true,
            cell: (row) => (
                <div>
                    <div
                        className={
                            row.stcg.balance < 0
                                ? "text-red-400"
                                : "text-green-400"
                        }
                    >
                        {renderWithTooltip(row.stcg.balance)}
                    </div>
                    <div className="text-xs text-gray-400">{row.stcg.gain}</div>
                </div>
            ),
        },
        {
            name: "Long-term",
            selector: (row) => parseFloat(row.ltcg.balance),
            sortable: true,
            cell: (row) => (
                <div>
                    <div
                        className={
                            row.ltcg.balance < 0
                                ? "text-red-400"
                                : "text-green-400"
                        }
                    >
                        {renderWithTooltip(row.ltcg.balance)}
                    </div>
                    <div className="text-xs text-gray-400">{row.ltcg.gain}</div>
                </div>
            ),
        },
        {
            name: "Amount to Sell",
            selector: (row) => parseFloat(row.toSell),
            sortable: true,
            cell: (row) => (
                <div className="text-white">
                    {renderWithTooltip(row.toSell)}
                </div>
            ),
        },
    ];

    return (
        <div className="bg-[#0d1117] text-white min-h-screen p-6 space-y-6 text-sm">
            <KoinXLogo />
            <div className="flex mr-5 pr-5 items-center">
                <h1 className="text-xl font-semibold mr-5">Tax Harvesting</h1>

                <div
                    className="relative"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <span className="text-blue-400 underline cursor-pointer">
                        How it works?
                    </span>
                    {showTooltip && (
                        <div className="absolute z-10 w-64 p-3 bg-black text-white text-xs rounded-md shadow-md top-6 left-0">
                            <p>
                                Lorem ipsum dolor sit amet consectetur. Euismod
                                id posuere nibh semper mattis scelerisque
                                tellus.
                            </p>
                            <a
                                href="#"
                                className="underline text-blue-300 mt-2 inline-block"
                            >
                                View More
                            </a>
                        </div>
                    )}
                </div>
            </div>

            <div className="border border-blue-400 rounded bg-[#161b22]">
                <button
                    className="w-full text-left p-3 font-medium flex items-center justify-between bg-[#1f2937] hover:bg-[#374151]"
                    onClick={() => setShowDisclaimers(!showDisclaimers)}
                >
                    <span className="text-blue-400">
                        Important Notes & Disclaimers
                    </span>
                    <span>{showDisclaimers ? "▲" : "▼"}</span>
                </button>
                {showDisclaimers && (
                    <ul className="p-4 space-y-1 text-gray-300 list-disc list-inside">
                        <li>
                            Tax-loss harvesting is currently not allowed under
                            Indian tax regulations.
                        </li>
                        <li>
                            Tax harvesting does not apply to derivatives or
                            futures.
                        </li>
                        <li>
                            Price and market value data is fetched from
                            Coingecko.
                        </li>
                        <li>
                            Some countries do not have a short-term / long-term
                            bifurcation.
                        </li>
                        <li>
                            Only realized losses are considered for harvesting.
                        </li>
                    </ul>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#161b22] p-4 rounded shadow">
                    <h2 className="font-semibold mb-3">Pre Harvesting</h2>
                    <div className="grid grid-cols-3 text-center font-medium text-gray-400">
                        <div></div>
                        <div>Short-term</div>
                        <div>Long-term</div>
                    </div>
                    <div className="grid grid-cols-3 text-center mt-2">
                        <div>Profits</div>
                        <div>${formatCompact(summary?.shortTerm.profit)}</div>
                        <div>${formatCompact(summary?.longTerm.profit)}</div>
                        <div>Losses</div>
                        <div>${formatCompact(summary?.shortTerm.loss)}</div>
                        <div>${formatCompact(summary?.longTerm.loss)}</div>
                        <div>Net Capital Gains</div>
                        <div>
                            $
                            {formatCompact(
                                (summary?.shortTerm.profit ?? 0) +
                                    (summary?.shortTerm.loss ?? 0)
                            )}
                        </div>
                        <div>
                            $
                            {formatCompact(
                                (summary?.longTerm.profit ?? 0) +
                                    (summary?.longTerm.loss ?? 0)
                            )}
                        </div>
                    </div>
                    <div className="mt-4 font-bold text-xl text-center text-white">
                        Realised Capital Gains:{" "}
                        <span>${formatCompact(summary?.realisedGains)}</span>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded shadow text-white">
                    <h2 className="font-semibold mb-3">After Harvesting</h2>
                    <div className="grid grid-cols-3 text-center font-medium">
                        <div></div>
                        <div>Short-term</div>
                        <div>Long-term</div>
                    </div>
                    <div className="grid grid-cols-3 text-center mt-2">
                        <div>Profits</div>
                        <div>${formatCompact(summary?.shortTerm.profit)}</div>
                        <div>${formatCompact(summary?.longTerm.profit)}</div>
                        <div>Losses</div>
                        <div>
                            ${formatCompact((summary?.shortTerm.loss ?? 0) * 3)}
                        </div>
                        <div>
                            ${formatCompact((summary?.longTerm.loss ?? 0) * 5)}
                        </div>
                        <div>Net Capital Gains</div>
                        <div>
                            $
                            {formatCompact(
                                (summary?.shortTerm.profit ?? 0) +
                                    (summary?.shortTerm.loss ?? 0) * 3
                            )}
                        </div>
                        <div>
                            $
                            {formatCompact(
                                (summary?.longTerm.profit ?? 0) +
                                    (summary?.longTerm.loss ?? 0) * 5
                            )}
                        </div>
                    </div>
                    <div className="mt-4 font-bold text-xl text-center text-yellow-300">
                        Effective Capital Gains:{" "}
                        <span>${formatCompact(summary?.effectiveGains)}</span>
                    </div>
                    {holdings.some((h) => h.selected) &&
                        summary?.savings > 0 && (
                            <div className="text-center mt-2 text-sm">
                                🎉 You are going to save up to{" "}
                                <strong>
                                    ${formatCompact(summary.savings)}
                                </strong>
                            </div>
                        )}
                </div>
            </div>

            <div className="bg-[#161b22] p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-3">Holdings</h2>
                {loading && <p className="text-gray-400">Loading data...</p>}
                {error && <p className="text-red-400">{error}</p>}
                {!loading && !error && (
                    <div className="w-full overflow-x-auto">
                        <DataTable
                            columns={columns}
                            data={viewAll ? holdings : holdings.slice(0, 5)}
                            pagination
                            striped
                            responsive
                            theme="dark"
                            highlightOnHover
                            customStyles={{
                                rows: { style: { backgroundColor: "#161b22" } },
                                headCells: {
                                    style: {
                                        backgroundColor: "#0d1117",
                                        color: "#c9d1d9",
                                        fontWeight: 600,
                                    },
                                },
                                cells: { style: { color: "#d1d5db" } },
                            }}
                        />
                    </div>
                )}
                <div
                    className="text-blue-400 mt-2 text-sm cursor-pointer"
                    onClick={() => setViewAll(!viewAll)}
                >
                    {viewAll ? "View less" : "View all"}
                </div>
            </div>
        </div>
    );
}
