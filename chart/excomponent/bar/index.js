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
        barHandle: null,
        letf: 0,
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
                    height: 400,
                    width,
                });
              } catch (e) {
                // Do something when catch error
            }
            const query = this.createSelectorQuery()
            query.select('#bar-canvas')
              .fields({ node: true, size: true })
              .exec((res) => {
              
                const canvas = res[0]
                // const ctx = canvas.getContext('2d')
                const ctx = wx.createCanvasContext('bar-canvas', this)
                console.log('ctx',ctx)
                const floatctx = wx.createCanvasContext('float-canvas', this)
                let barHandle = new BarHandle(ctx, floatctx, this)
                barHandle.setOption({ 
                    height: canvas.height / 2,
                    width: canvas.width
                })
                this.data.barHandle = barHandle
                console.log(barHandle.getOption())
              })
            
        },
        bindTap(event) {
            // console.log('bindTouchStart', event.detail)
            console.log('bindTouchStart', event)
            let { offsetLeft, offsetTop } = event.currentTarget
            let {clientX: x, clientY: y } = event.touches[0]
            let currentTapData = this.data.barHandle.bindTap(x - offsetLeft, y - offsetTop)
            console.log('currentTapData', currentTapData)
        }
    }
})
