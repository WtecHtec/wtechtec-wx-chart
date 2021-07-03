export const CONFIG = {
    width: 320,
    height: 250,
    grid: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
    },
    radius: 0.8,
    ticks: 3,
    radar:  
    [

            { name: '销售', max: 6500},
            { name: '管理', max: 16000},
            { name: '信息技术', max: 30000},
            { name: '客服', max: 38000},
            { name: '研发', max: 52000},
            { name: '市场', max: 25000}
    ],
    series: {
        data: [
            {
                value: [4200, 3000, 20000, 35000, 50000, 18000],
                name: '预算分配（Allocated Budget）'
            },
            {
                value: [5000, 14000, 28000, 26000, 42000, 21000],
                name: '实际开销（Actual Spending）'
            }
        ]
    }
    
}