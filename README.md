#### Task
###将下面的所有指标进行可视化
* tem ：气温（摄氏度）
* prs ：地面气压（hPa）
* rhu ：相对湿度（%）
* pre ：降水量（mm）
* wns ：风速（m/s）
* wnd ：风向（degree）
* wns_100m ：100m风速（m/s）
* wnd_100m ：100m风向（degree）
* clo ：云量（%）
* vis ：能见度（km）
* gust ：10m阵风风速（m/s）
* ssrd ：太阳总辐照度（kWh/m^2）
* uvb ：紫外线UV辐照度（kWh/m^2）
* u ：经向风
* v ：纬向风
* u_100 ：100m经向风速
* v_100 ：100m纬向风速
* st_5 ：5cm土壤温度（c摄氏度或f华氏度）
* st_10 ：10cm土壤温度（c摄氏度或f华氏度）
* st_40 ：40cm土壤温度（c摄氏度或f华氏度）
* st4_200 ：200cm土壤温度（c摄氏度或f华氏度）
* sw_5 ：5cm土壤湿度（%）
* sw_10 ：10cm土壤湿度（%）
* sw_40 ：40cm土壤湿度（%）
* sw_200 ：200cm土壤湿度（%）
* sdp ：雪深（m）
* skt ：地表温度（c摄氏度或f华氏度）


####相关说明
###数据处理
*利用python程序将每个json文件重命名为时间点.json，如2021072212.json，表示2021年7月22日12点整的相关数据
*每一个json文件表示一个时间点的418个区域的相关数据，存储在data_all/data中
*将每个地区包含的经纬度坐标取平均，得到质心的经纬度，命名为position.json
*对秦岭地区进行矩形剖分，根据数据，划分为34*13个矩形网格，每个网格节点的取值要求为：找到距离该节点最近的质心，若小于矩形的长宽，取该风力值和风向，否则，取零
*根据两组风力数据，分别得到data_all/wind和data_all/wind_100
*原始命名的数据存储在data_all/raw_data中

###文件说明
##html文件
*包括q1_map.html，q1_map2_1.html，q1_map2_2.html，q1_map3.html，分别负责展示Section1, Section2, Section3的可视化界面展示
##js文件
*包括Section1.js，Section2_1.js，Section2_2.js，Section3.js，是Section1, Section2, Section3可视化界面具体实现方式的js代码
##css文件 
*main.css包括了所有界面的字体、位置、大小等内容的设定

###使用说明
*使用webstorm打开项目，任意运行主目录下的一个html可以进入可视化界面，如运行q1_map.html

##Section1页面
#基本展示
*任意选定秦岭图中的区域，即可获得对应区域的名称，同时选中区域变色
*如选中中上方某个区域时，tooltip显示——西安市长安区东大街道
#文字描述
*在表单中滑动选中想要观察的时间点，如在Select Day中选择2021-07-24，在最下面我们新加入了可滑动的时间条，可以在选择日期后，任意选定其中的一个时间点，如06：00：00后，即可更新，无需click秦岭图
*注意！当没有在表单中选择时间节点时，直接click会进行提示
*此时，任意选定秦岭图中的区域，不仅拥有基本展示中的全部功能，同时在文本框中将显示所有的气候特征信息，包括温度值，相对湿度值等
*另外，也将展示不同条件下，同一地区类似指标的柱状图，如气温和地表温度，云的环状图等
#空间维观察
*打开网页，在表单中滑动选中想要观察的时间点，可以在表单Select map中，选择任意一个想要观察的气候特征，如teperature map
*此时，显示的秦岭图将根据选择的气候特征发生相应的变化，如对于温度，不同区域的显示颜色为红色，并根据温度高低决定红色深浅，具体对应关系在左下角显示
*当然，不同气候特征有不同的变换，如Visibility map，从低到高颜色由深到浅
*任意选定秦岭图中的区域，继承了文字描述中的全部功能，如在文本框中将显示所有的气候特征信息，包括温度值，相对湿度值等
*另外在tooltip中，还显示当前该地区的气候特征，如选择Visibility map时，tooltip显示——西安市长安区东大街道Visibility:12.73km
#more details
*点击show ssrd, Section1实现了环状图，点图等功能,从更多的角度探索了数据的可视化方式



##Section2页面
*两种方式可以打开，一种时直接运行q1_map2_1.html，另外，如果之前已经运行了某个html文件，可以直接在界面中点击Section2进行切换
*Section2包括basic和Advanced两部分，其中Advanced实现了wind flow
*设计Section2中Advanced界面原因：直接用箭头描述风向缺乏直观性，风是流动的，可以通过向量场进行描述，因此，采用双线性插值等手段，构造风向量场，进而可视化
*当然，不同气候特征有不同的变换，如wind map，结合风速和风向进行显示
*点击update，更新向量场，在Select Day和Select Time中选择时间后，再次点击update，可更新到相应时间的风场
*点击Mode，可以更换背景颜色
*点击canvas上的任意部分，可以对选中区域进行放大操作，可以重复
*点击zoom out，初始化到初始状态
*注意！由于风场的动画消耗资源较多，因此可能出现更新不及时的问题，如果出现，可以更换时间点，并点击update


##Section3页面
*两种方式可以打开，一种时直接运行q1_map3.html，另外，如果之前已经运行了某个html文件，可以直接在界面中点击Section3进行切换
*和Section1类似，包含Section1的全部功能，不同点在于可视化的指标，Section1的指标之间关系非常密切，如10cm-200cm的土壤温度，土壤湿度等
#基本展示
*运行q1_map.html后，打开网页，任意选定秦岭图中的区域，即可获得对应区域的名称，同时选中区域变色
*如选中中上方某个区域时，tooltip显示——西安市长安区东大街道
#文字描述
*运行q1_map.html后，打开网页，在表单中滑动选中想要观察的时间点，如在Select Day中选择2021-07-24，在Select Time中选择06：00：00
*click秦岭图，即可刷新，注意！当没有在表单中选择时间节点时，直接click会进行提示
*当然，在最下面我们新加入了可滑动的时间条，可以在选择日期后，任意选定其中的一个时间点，如06：00：00后，即可更新，无需click秦岭图
*此时，任意选定秦岭图中的区域，不仅拥有基本展示中的全部功能，同时在文本框中将显示所有的气候特征信息，包括温度值，相对湿度值，风速等
*另外，也将展示不同条件下，同一地区类似指标的柱状图，如10cm-200cm的土壤温度等
#空间维观察
*运行q1_map.html后，打开网页，在表单中滑动选中想要观察的时间点，如在Select Day中选择2021-07-24，在Select Time中选择06：00：00
*另外，运用控制变量法，可以在表单Select map中，选择任意一个想要观察的气候特征，如Wind map
*click秦岭图，即可刷新，注意！如果发现有刷新延迟的现象，多click一次，或者拖动鼠标随意滑过几个区域即可
*此时，显示的秦岭图将根据选择的气候特征发生相应的变化，如对于温度，不同区域的显示颜色为红色，并根据温度高低决定红色深浅，具体对应关系在左下角显示
*任意选定秦岭图中的区域，继承了文字描述中的全部功能，如在文本框中将显示所有的气候特征信息，包括温度值，相对湿度值，风速等
*另外在tooltip中，还显示当前该地区的气候特征，如选择Average Soil temperature map时，tooltip显示——西安市长安区东大街道Average Soil temperature:15.05°C
