class ToolUtil {
	constructor(arg) {
		
	}
	
	//  测量文字的宽度
	MeasureTextWidth(text) {
	    var fontSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
	    // wx canvas 未实现measureText方法, 此处自行实现
	    text = String(text);
	    var text = text.split('');
	    var width = 0;
	    text.forEach(function (item) {
	        if (/[a-zA-Z]/.test(item)) {
	            width += 7;
	        } else if (/[0-9]/.test(item)) {
	            width += 5.5;
	        } else if (/\./.test(item)) {
	            width += 2.7;
	        } else if (/-/.test(item)) {
	            width += 3.25;
	        } else if (/[\u4e00-\u9fa5]/.test(item)) {
	            width += 10;
	        } else if (/\(|\)/.test(item)) {
	            width += 3.73;
	        } else if (/\s/.test(item)) {
	            width += 2.5;
	        } else if (/%/.test(item)) {
	            width += 8;
	        } else {
	            width += 10;
	        }
	    });
	    return width * fontSize / 10;
	}
	
	ChangeUnit(value){
		let unit = ''
		let beishu = 1
		if (value >= 1e3) unit = 'k', beishu = 1e3
		else if (value >= 1e4) unit = 'w', beishu = 1e4
		else if (value >= 1e7) unit = 'kw', beishu = 1e7
		if(unit) return (value/beishu).toFixed(1) + unit
		return value.toFixed(0)
	}
	
}

export default ToolUtil;