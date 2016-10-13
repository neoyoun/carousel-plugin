###这是一个支持滑动切换的轮播图插件
####理论上支持 IE8+和现代浏览器 ,还没完整测试
####JS文件使用了0es6语法，babel转译，不需要jQuery或其他库支持。
####css使用scss编写，插件只定义的滚动项和外层盒子的宽度，其他样式需要自己编写，可参考我自己的写法。

####HTML结构参考 demo.html 文件，其中必须的规则有几点：
* 1.滚动外盒需要添加 role="list-box" 属性
* 2.滚动项的样式必须包含 slide-item (可在 js/carousel-es6.js 中自己改)
* 3.滚动指示器的盒子必须添加  role="indicators" 属性。为了方便，指示器的数量不需要和滚动项一致，脚本中会补齐。建议要么写一个，要么写数量一致。如果不需要指示器可以留空
* 4.上下切换按钮必须包含 data-slide=prev 和 data-slide=next 如果没有两个同时存在，没有切换功能。

####插件用法:
#####通过在 HTMLElement.prototype 上添加 slide 方法供所有HTML元素调用

	Element.slide({
		interval : 3000,       // number 滚动间隔
		direction : 'left',    // string 'left' of 'right'
		pause : 'hover',	   // string  'hover'支持鼠标悬停，不需要可删除
		auto : true		  	 // boolean 自动滚动,默认 true 	
	})

#####在调用 slide 方法的元素上添加 .slide 类名可忽略 auto 

