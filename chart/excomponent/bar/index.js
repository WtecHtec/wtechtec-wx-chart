// chart/excomponent/bar/index.js
import BarHandle from './handle'
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        height: {
            type: Number,
            value: 0,
        },
        width: {
            type: Number,
            value: 0,
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },
    lifetimes: {
        attached(){
            this._initChartBox()
        },
    },

    /**
     * 组件的方法列表
     */
    methods: {
        _initChartBox(){
            try {
                const res = wx.getSystemInfoSync()
                let { height , width } = res.safeArea
                this.data.height =  height
                this.data.width =  width
                this.setData({ 
                    height,
                    width,
                });
              } catch (e) {
                // Do something when catch error
            }
            const query = this.createSelectorQuery()
            query.select('#bar-canvas')
              .fields({ node: true, size: true })
              .exec((res) => {
                  console.log(res)
                const canvas = res[0].node
                const ctx = canvas.getContext('2d')
                // const ctx = wx.createCanvasContext('bar-canvas')

                let barHandle = new BarHandle(ctx)
                barHandle.setOption({ 
                    height: canvas.height,
                    width: canvas.width
                })
                console.log(barHandle.getOption())
              })
            
        }
    }
})
