import React from 'react';

export default function TopSelling({ products }) {
    // Chỉ lấy đúng 3 sản phẩm từ danh sách backend trả về
    const topThree = products.slice(0, 3);

    return (
        <div className="border border-slate-200 bg-white p-6">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <div>
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic">
                        Top 03 Sản Phẩm Bán Chạy
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                        Thống kê hiệu suất theo tháng
                    </p>
                </div>
                <div className="text-[10px] font-mono font-bold bg-slate-900 text-white px-3 py-1">
                    Give_A_LOVER
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topThree.length > 0 ? topThree.map((item, index) => (
                    <div
                        key={index}
                        className="group border border-slate-100 p-5 flex flex-col items-center hover:border-slate-900 transition-all duration-300 relative overflow-hidden"
                    >
                        <span className="absolute -top-2 -left-2 text-6xl font-black text-slate-50 group-hover:text-slate-100 transition-colors z-0">
                            0{index + 1}
                        </span>

                        <div className="z-10 w-full">
                            <h5 className="text-sm font-black text-slate-900 uppercase mb-4 truncate italic">
                                {item.productName}
                            </h5>

                            <div className="space-y-2 border-t border-slate-50 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Số lượng bán</span>
                                    <span className="text-sm font-mono font-bold text-slate-900 bg-slate-100 px-2 leading-none">
                                        {item.totalSold}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tổng doanh thu</span>
                                    <span className="text-sm font-bold text-slate-900">
                                        ${Number(item.totalRevenue).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-3 py-12 text-center border border-dashed border-slate-200">
                        <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                            --- NO_DATA_FOR_THIS_PERIOD ---
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}