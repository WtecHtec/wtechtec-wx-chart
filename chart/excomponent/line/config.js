export const CONFIG = {
    width: 320,
    height: 250,
    ticks: 7,
    grid: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
    },
    xAxis: {   
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],  
    },
    yAxis: [
	    {
            name: '水量',
            min: 0
		}
    ],
    series: {
        line: [
            {
                name: '平均温度',
                data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3]
            },
            {
                name: '平均温度1',
                data: [14.0, 12.2, 18.3, 14.5, 16.3, 6.2, 10.5]
            },
            {
                name: '平均温度2',
                data: [5.0, 2.2, 8.3, 4.5, 18.3, 16.2, 24.3]
            }
        ]
    }

}