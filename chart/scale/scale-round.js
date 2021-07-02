// 平分

class MyScaleRound {
	constructor(arg) {
		this.rangeVal = []
		this.domainVal = []
		this.rangeRoundVal  = 0
	}
	domain(arr) {
	    try {
	        if (!Array.isArray(arr)) throw 'domain 参数不是一个数组。'
	        this.domainVal = [...arr]
	    } catch (e) {
	        console.error(e)
	    }
	    return this
	}
	
	rangeRoundBands(arr){
		try {
		    if (!Array.isArray(arr)) throw 'rangeRoundBands 参数不是一个数组。'
		    this.rangeVal = [...arr]
		} catch (e) {
		    console.error(e)
		}
		this.rangeRoundVal = (this.rangeVal[1] - this.rangeVal[0] )/ this.domainVal[0]
		return this ;
	}
	
	getRangeBand(val){
		return this.rangeRoundVal * (val)
	}
	
	rangeBand(){
		return this.rangeRoundVal
	}
}
export default MyScaleRound
