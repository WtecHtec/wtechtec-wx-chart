// chart/excomponent/bar/index.js
import FunnelHandle from './handle'

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
        funnelHandle: null,
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
              
                const canvas = res[0]
                // const ctx = canvas.getContext('2d')
                const ctx = wx.createCanvasContext('bar-canvas', this)
                console.log('ctx',ctx)
                const floatctx = wx.createCanvasContext('float-canvas', this)
                let funnelHandle = new FunnelHandle(ctx, floatctx, this)
                funnelHandle.setOption({ 
                    height: canvas.height/2 ,
                    width: canvas.width
                })
                this.data.funnelHandle = funnelHandle
                console.log(funnelHandle.getOption())
              })
            
        },
        bindTap(event) {
            // console.log('bindTouchStart', event.detail)
            let { offsetLeft, offsetTop } = event.currentTarget
            let { x, y } = event.detail
            let touchData = this.data.funnelHandle.bindTap(x - offsetLeft, y - offsetTop)
            console.log(touchData)
        }
    }
})
