// import {map} from "./d3";

// import {map} from "./d3";

let width = 1100, height = 600;

let svg = d3.select("#test-svg")
    .append('svg')
    .attr('width', width + 'px')
    .attr('height', height + 'px');

/**
 * define map projection
 * Automatically scale the map to the center of the svg according to the size of the svg
 */
let projection = d3.geoMercator()
    .fitSize([width, height], qinling);

let features = qinling.features;

// Project in an adaptive way，The data type of features is geojson, and existing data may need to be processed
// const projection = d3.geoMercator().fitSize([width, height], features);
let path = d3.geoPath().projection(projection);
// color in the map
let ss2 = d3.schemeSet2;
let sp2 = d3.schemePastel2;
let regions = svg.append('g')
    .attr('class', 'map')
    .selectAll('.china')
    .data(features)
    .join('path')
    .attr("class", "china")
    .attr("fill", ss2[7])
    .attr('d', path)
    .attr("stroke", "white")
    .attr("stroke-width", 0.3)
    .on("mouseover", function(d, i) {
        d3.select(this)
            .attr("fill", ss2[6]);
    })
    .on("mouseout", function(d, i) {
        d3.select(this)
            .attr("fill", ss2[7]);
    });

    d3.selectAll('.form-control').on('change',click);
    click();

$.ajax({
    type: "get",
    url: "./data_all/data/2021072200.json",
    dataType: "json",
    // data file path
    success: function (data) {
        // changing color when the mouse hovers
        regions.on("mouseover", function (d) {
            d3.select(this)
                .attr("fill", ss2[6]);
            /**
             * 在未选择具体的气候特征图时，保证基本的tooltip等功能
             */
            let show_infor = svg.append("g")
                .attr("class", "infor_text")
                .style("z-index", -1);
            let geographic_data = d3.select(this).data()[0]["properties"]["省C"];
            let geographic_name = geographic_data[1];
            let coordinate = projection(d3.select(this).data()[0]["geometry"]["coordinates"][0][0]);
            let text = show_infor.selectAll("text")
                .data(geographic_name)
                .join("text")
                .attr('id', 'tag')
                .attr("x", function (d){
                    if (coordinate[0] > 325){
                        return coordinate[0] - 60
                    }
                    else {
                        return coordinate[0] + 60
                    }
                })
                .attr("y", function (d){
                    if (coordinate[1] > 325){
                        return coordinate[1] - 60
                    }
                    else {
                        return coordinate[1] + 60
                    }
                })
                .attr("font-size", 15)
                .attr("fill", ss2[8])
                .attr("text-anchor", "middle")
                .text(function (d, i) {
                    return d;
                })
                .attr("transform", function (d, i) {
                    let size = this.getBBox();
                    return "translate(" + (size.width / 2 + 5) + "," + size.height * (i + 1) + ")";
                });
            d3.selectAll('text')
                .insert('g', '#tag');

        }).on("mouseout", function (d) {
            d3.select(this)
                .attr("fill", ss2[7]);
            // d3.select('svg').selectAll("text").remove();
            d3.selectAll('#tag').remove();
        });
    }
});

function click() {

    /**
     * 确保点击秦岭地图时，刷新显示
     */
    let weather_json_file_name;
    let weather_json_file_path;
    let map_end;
    $(document).ready(function (){
        let day = $('#day option:selected').val();
        let time = $('#time option:selected').val();
        let map = $('#map option:selected').val();
        if ((day) ===''){
            alert('Please select one day and time before choosing a region on the map.');
            return false;
        };

        if (day === "1") day = "20210722";
        if (day === "2") day = "20210723";
        if (day === "3") day = "20210724";
        if (day === "4") day = "20210725";
        if (day === "5") day = "20210726";
        if (day === "6") day = "20210727";

        if (time === "1") time = "00";
        if (time === "2") time = "01";
        if (time === "3") time = "02";
        if (time === "4") time = "03";
        if (time === "5") time = "04";
        if (time === "6") time = "05";
        if (time === "7") time = "06";
        if (time === "8") time = "07";
        if (time === "9") time = "08";
        if (time === "10") time = "09";
        if (time === "11") time = "10";
        if (time === "12") time = "11";
        if (time === "13") time = "12";
        if (time === "14") time = "13";
        if (time === "15") time = "14";
        if (time === "16") time = "15";
        if (time === "17") time = "16";
        if (time === "18") time = "17";
        if (time === "19") time = "18";
        if (time === "20") time = "19";
        if (time === "21") time = "20";
        if (time === "22") time = "21";
        if (time === "23") time = "22";
        if (time === "24") time = "23";

        if (range_change === 1){
            var d = jQuery('.value').html();
            time = parseInt(d.slice(11,d.length), 10);
            if (time < 10) time = "0" + time;
            // range_change = 0;
        }


        if (map === "1") map_end = 'tem';
        if (map === "2") map_end = 'rhu';
        if (map === "3") map_end = 'wnd';
        if (map === "4") map_end = 'wnd_100m';

        weather_json_file_name = day + time + ".json"; //instantiate variable for reading file
        weather_json_file_path = "data_all/" + "data/" + weather_json_file_name
        if (map !== ""){
            $.ajax({
                type: "get",
                url: weather_json_file_path,
                dataType: "json",
                // data file path
                success: function (data) {
                    // changing color when the mouse hovers
                    d3.selectAll('#arrow_id').remove();
                    d3.select('svg').selectAll("text").remove();
                    d3.selectAll('#arrow_id').remove();
                    let regions1 = svg.append('g')
                        .attr('class', 'map')
                        .selectAll('.china')
                        .data(features)
                        .join('path')
                        .attr("class", "china")
                        .attr("fill", function(d) {
                            return show_ecological_color(d, map_end, data);
                        })
                        .attr('d', path)
                        .attr("stroke", "white")
                        .attr("stroke-width", 0.3)
                        // .on("click", click);
                    show_ecological_data(weather_json_file_path, regions1, map_end)
                }
            });
        }

        show_ecological_data(weather_json_file_path, regions, map_end)
    });
}


function show_ecological_color(d, name, data){
    /**
     *根据当前选中的需要显示的气候特征图，改变秦岭图各个区域的显示颜色
     */
    let show_name;
    if (name === "rhu") {
        // draw color map(num to color)
        // d3.selectAll('#arrow_id').remove();
        // d3.selectAll('#arrow_id').remove();
        show_name = "Average Soil moisture"
        let color = d3.scaleThreshold()
            .domain(d3.range(2, 10))
            .range(d3.schemeBlues[9]);
        let real_map = d3.range(18, 50, 4);
        let sign = "%"
        show_map_color(color, show_name, real_map, sign, data["data"][d["properties"]["省C"][0]]["date"])

        // update qingling map
        let rhu_color = d3.scaleThreshold()
            .domain(d3.range(18, 50, 4))
            .range(d3.schemeBlues[9]);
        let geographic_rhu= (data["data"][d["properties"]["省C"][0]]["sw_5"] + data["data"][d["properties"]["省C"][0]]["sw_10"] + data["data"][d["properties"]["省C"][0]]["sw_40"] + data["data"][d["properties"]["省C"][0]]["sw_200"]) * 25;
        return rhu_color(geographic_rhu)
    }
    if (name === "tem") {
        // d3.selectAll('#arrow_id').remove();
        // draw color map(num to color)
        show_name = "Average Soil temperature"
        let color = d3.scaleThreshold()
            .domain(d3.range(2, 10))
            .range(d3.schemeReds[9]);
        let real_map = d3.range(11, 35, 3);
        let sign = "°C"
        show_map_color(color, show_name, real_map, sign, data["data"][d["properties"]["省C"][0]]["date"])

        // update qingling map
        let rhu_color = d3.scaleThreshold()
            .domain(d3.range(11, 35, 3))
            .range(d3.schemeReds[9]);
        let geographic_tem= (data["data"][d["properties"]["省C"][0]]["st_5"] + data["data"][d["properties"]["省C"][0]]["st_10"] + data["data"][d["properties"]["省C"][0]]["st_40"] + data["data"][d["properties"]["省C"][0]]["st_200"]) / 4;
        return rhu_color(geographic_tem)
    }
    if ((name === "wnd") | (name === "wnd_100m")) {
        // draw color map(num to color)
        let lat_u, lat_v, wind_dir;
        if (name === "wnd") {
            show_name = "Wind";
            lat_u = "u";
            lat_v = "v";
            wind_dir = "wnd";
        }

        else {
            show_name = "100m Wind";
            lat_u = "u_100";
            lat_v = "v_100";
            wind_dir = "wnd_100m";
        }
        let color = d3.scaleThreshold()
            .domain(d3.range(2, 10))
            .range(d3.schemeGreens[9]);
        let real_map = d3.range(1, 9);
        let sign = "km/h"
        show_map_color(color, show_name, real_map, sign, data["data"][d["properties"]["省C"][0]]["date"])

        // update qingling map
        let rhu_color = d3.scaleThreshold()
            .domain(d3.range(1,9))
            .range(d3.schemeGreens[9]);
        let geographic_wnd;
        if (name === "wnd") geographic_wnd = data["data"][d["properties"]["省C"][0]]["wns"];
        if ((name === "wnd_100m")) geographic_wnd = data["data"][d["properties"]["省C"][0]]["wns_100m"];

        // draw arrow
        let arrow2 = svg.append('g')
            .attr('id', 'arrow_id')
            .attr("transform", "translate(0,0)");

        let marker = arrow2.append("marker")
            .attr("id", "arrow")
            .attr("markerUnits","strokeWidth")//设置为strokeWidth箭头会随着线的粗细发生变化
            // .attr("viewBox", "0 0 12 12")//坐标系的区域
            .attr("refX", 6)//箭头坐标
            .attr("refY", 6)
            .attr("markerWidth", 10)
            .attr("markerHeight", 10)
            .attr("orient", "auto")//绘制方向，可设定为：auto（自动确认方向）和 角度值
            .append("path")
            .attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2")//箭头的路径
            .attr('fill', '#808080');//箭头颜色

        let point1_coordinate = projection(d["geometry"]["coordinates"][0][0]);
        if (point1_coordinate[1] > 325) point1_coordinate[1] = point1_coordinate[1] - 15;
        else point1_coordinate[1] = point1_coordinate[1] + 15;
        let wind_direction = data["data"][d["properties"]["省C"][0]][wind_dir];
        wind_direction = 180 + wind_direction;
        let point2_coordinate = [point1_coordinate[0] - 10*math.sqrt(2)*math.sin(wind_direction/180*math.PI), point1_coordinate[1] + 10*math.sqrt(2)*math.cos(wind_direction/180*math.PI)];
        let line = arrow2.append("line")
            // .attr("id", "line")
            .attr("x1",point1_coordinate[0])
            .attr("y1",point1_coordinate[1])
            .attr("x2",point2_coordinate[0])
            .attr("y2",point2_coordinate[1])
            .attr("stroke","#808080")
            .attr("stroke-width",2)
            .attr("marker-end","url(#arrow)");
        d3.selectAll('arrow2')
            .insert('g', '#arrow_id');
        // d3.selectAll('line')
        //     .insert('g', '#line')
        return rhu_color(geographic_wnd)
    }
}

function show_map_color(color, name, real_map, sign, date){
    /**
     *根据当前显示的气候特征图，输出颜色深度与气候特征数的对应关系，并在右下角显示
     */
    d3.selectAll('#color_rect_id').remove();
    d3.selectAll('#captions_id').remove();
    d3.selectAll('#color_domain_id').remove();
    let x = d3.scaleLinear()
        .domain([1, 10])
        .rangeRound([600, 860]);
    let color_rect = svg.append("g")
        .attr("class", "key")
        .attr('id', 'color_rect_id')
        .attr("transform", "translate(170,520)");

    color_rect.selectAll("rect")
        .data(color.range().map(function(d) {
            d = color.invertExtent(d);
            if (d[0] == null) d[0] = x.domain()[0];
            if (d[1] == null) d[1] = x.domain()[1];
            return d;
        }))
        .enter().append("rect")
        .attr("height", 8)
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .attr("fill", function(d) { return color(d[0]); });

    d3.selectAll('color_rect')
        .insert('g', '#color_rect_id');

    let captions = svg.append("g")
        .attr("class", "caption_text")
        .attr('id', 'captions_id')
        .attr("transform", "translate(170,520)");
    captions.append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(name);
    d3.selectAll('captions')
        .insert('g', '#captions_id');

    let color_domain = svg.append("g")
        .attr("class", "color_domain")
        .attr('id', 'color_domain_id')
        .attr("transform", "translate(170,520)");
    color_domain.call(d3.axisBottom(x)
        .tickSize(13)
        .tickFormat(function(x, i) {
            if (i === 0) return real_map[i] + sign;
            return real_map[i];
            // return i ? x : x + "%";
        })
        .tickValues(color.domain()))
        .select(".domain")
        .remove();
    d3.selectAll('captions')
        .insert('g', '#color_domain_id');
    let real_time;
    if (date.slice(-2) < "12") real_time = date.slice(-2) + ":00:00" + " a.m";
    if (date.slice(-2) === "12") real_time = date.slice(-2) + ":00:00" + " noon";
    if (date.slice(-2) > "12") real_time = date.slice(-2) + ":00:00" + " p.m";
    real_time = real_time + " on July " + date.slice(-4, -2) + ", 2021";
    if (name === "Wind Speed") real_time = real_time + " " + "0m Wind" + " " + "Reigonal" +  " map";
    else if(name === "100m wind Speed") real_time = real_time + " " + "100m Wind" + " " + "Reigonal" +  " map";
    else {
        // d3.selectAll('#arrow_id').remove();
        real_time = real_time + " " + name + " " + "Reigonal" +  " map";
    }
    document.getElementById('new-time').innerHTML =
        '<span id="show_day">' + real_time + '<br></span>';
}

function show_ecological_data(weather_json_file_path, regions, map_end){
    $.ajax({
        type: "get",
        url: weather_json_file_path,
        dataType: "json",
        // data file path
        success: function (data) {
            // changing color when the mouse hovers
            regions.on("mouseover", function (d) {
                d3.select(this)
                    .attr("fill", ss2[6]);
                /**
                 *读取鼠标当前选中区域，并根据相应的json文件输出当前区域的气候特征，包括温度，湿度，风力等
                 */
                let lat_u, lat_v;
                if (map_end === "wnd") {
                    lat_u = "u";
                    lat_v = "v";
                }

                else {
                    lat_u = "u_100";
                    lat_v = "v_100";
                }
                let show_infor = svg.append("g")
                    .attr("class", "infor_text")
                    .style("z-index", -1);
                let geographic_data = d3.select(this).data()[0]["properties"]["省C"];
                let geographic_name
                if (map_end !== undefined){
                    let geographic_num = geographic_data[0];
                    let geographic_element
                    if (map_end === "tem") geographic_element= 'Average Soil temperature:' + ((data["data"][geographic_num]["st_5"] + data["data"][geographic_num]["st_10"] + data["data"][geographic_num]["st_40"] + data["data"][geographic_num]["st_200"]) / 4).toFixed(2) + "°C";
                    if (map_end === "rhu") geographic_element= 'Average Soil moisture:' + ((data["data"][geographic_num]["sw_5"] + data["data"][geographic_num]["sw_10"] + data["data"][geographic_num]["sw_40"] + data["data"][geographic_num]["sw_200"]) * 25).toFixed(2) + "%";
                    if ((map_end === "wnd")){
                        let geographic_element1 = 'Wind speed:' + data["data"][geographic_num]["wns"].toFixed(2) + "km/h";
                        let geographic_element2 = 'Wind direction:'+ data["data"][geographic_num][map_end].toFixed(2) + '°'
                        geographic_element= Array.prototype.concat(geographic_element1, geographic_element2);
                    }
                    if ((map_end === "wnd_100m")){
                        let geographic_element1 = '100m Wind speed:' + data["data"][geographic_num]["wns_100m"].toFixed(2) + "km/h";
                        let geographic_element2 = '100m Wind direction:'+ data["data"][geographic_num][map_end].toFixed(2) + '°'
                        geographic_element= Array.prototype.concat(geographic_element1, geographic_element2);
                    }
                    geographic_name = Array.prototype.concat(geographic_data[1], geographic_element);
                }
                else{
                    geographic_name = geographic_data[1];
                }
                let coordinate = projection(d3.select(this).data()[0]["geometry"]["coordinates"][0][0]);
                let text = show_infor.selectAll("text")
                    .data(geographic_name)
                    .join("text")
                    .attr('id', 'tag')
                    .attr("x", function (d){
                        if (coordinate[0] > 425){
                            return coordinate[0] - 270
                        }
                        else {
                            return coordinate[0] + 30
                        }
                    })
                    .attr("y", function (d){
                        if (coordinate[1] > 325){
                            return coordinate[1] - 90
                        }
                        else {
                            return coordinate[1] + 70
                        }
                    })
                    .attr("font-size", 15)
                    .attr("fill", ss2[8])
                    .attr("text-anchor", "middle")
                    .text(function (d, i) {
                        return d;
                    })
                    .attr("transform", function (d, i) {
                        let size = this.getBBox();
                        return "translate(" + (size.width / 2 + 5) + "," + size.height * (i + 1) + ")";
                    });
                d3.selectAll('text')
                    .insert('g', '#tag');
                // show_infor.append("rect")
                //     .attr("x", coordinate[0])
                //     .attr("y", coordinate[1])
                //     .attr("width", 100)
                //     .attr("height", 50)
                //     .attr("stroke", "red")
                //     .attr("fill", rgba(255, 255, 0, 0.5));
                // show_infor.attr("transform", function () {
                //     return "translate(" + geographic_name[0] + "," + geographic_name[1] + "," + geographic_name[2] + ")";
                // }).style("display", "inline").style("z-index", 999);


                /**
                 * 输出到框中
                 */
                    // let array1 = data
                let geographic_num = geographic_data[0];
                let geographic_weather= data["data"][geographic_num];
                $('#temperature').val('Average Soil temperature:'+ ((geographic_weather["st_5"] + geographic_weather["st_10"] + geographic_weather["st_40"] + geographic_weather["st_200"]) / 4).toFixed(2) + '°C');
                $('#humanity').val('Average Soil moisture:'+ ((geographic_weather["sw_5"] + geographic_weather["sw_10"] + geographic_weather["sw_40"] + geographic_weather["sw_200"]) *25).toFixed(2) + '%');
                $('#5cm_Soil_temperature').val('5cm Soil temperature:'+ geographic_weather["st_5"].toFixed(2) + '°C');
                $('#10cm_Soil_temperature').val('10cm Soil temperature:'+ geographic_weather["st_10"].toFixed(2) + '°C');
                $('#40cm_Soil_temperature').val('40cm Soil temperature:'+ geographic_weather["st_40"].toFixed(2) + '°C');
                $('#200cm_Soil_temperature').val('200cm Soil temperature:'+ geographic_weather["st_200"].toFixed(2) + '°C');
                $('#5cm_Soil_humanity').val('5cm Soil humanity:'+ (geographic_weather["sw_5"]*100).toFixed(2) + '%');
                $('#10cm_Soil_humanity').val('10cm Soil humanity:'+ (geographic_weather["sw_10"]*100).toFixed(2) + '%');
                $('#40cm_Soil_humanity').val('40cm Soil humanity:'+ (geographic_weather["sw_40"]*100).toFixed(2) + '%');
                $('#200cm_Soil_humanity').val('200cm Soil humanity:'+ (geographic_weather["sw_200"]*100).toFixed(2) + '%');


                if ((map_end === "tem")|(map_end === "rhu")){
                    d3.selectAll('#arrow_id').remove();
                }
                let tem_data = [];
                let rhu_data = [];
                let new_tem5, new_tem10, new_tem40, new_tem200;
                let new_hum5, new_hum10, new_hum40, new_hum200;
                // let sm_data = [], dir_data = [];
                new_tem5 = new Soil('5 CM', data["data"][geographic_num]["st_5"]);
                new_tem10 = new Soil('10 CM', data["data"][geographic_num]["st_10"]);
                new_tem40 = new Soil('40 CM', data["data"][geographic_num]["st_40"]);
                new_tem200 = new Soil('200 CM', data["data"][geographic_num]["st_200"]);
                tem_data.push(new_tem5);
                tem_data.push(new_tem10);
                tem_data.push(new_tem40);
                tem_data.push(new_tem200);
                new_hum5 = new Soil('5 CM', data["data"][geographic_num]["sw_5"] * 100);
                new_hum10 = new Soil('10 CM', data["data"][geographic_num]["sw_10"] * 100);
                new_hum40 = new Soil('40 CM', data["data"][geographic_num]["sw_40"] * 100);
                new_hum200 = new Soil('200 CM', data["data"][geographic_num]["sw_200"] * 100);
                rhu_data.push(new_hum5);
                rhu_data.push(new_hum10);
                rhu_data.push(new_hum40);
                rhu_data.push(new_hum200);
                drawBar(rhu_data,"left", "rhu");
                drawBar(tem_data, "right", "tem");


                // let sm_data = [];
                // let dir_data = [];
                // let new_sm, new_sm100, new_gust;
                // let new_dir, new_dir100;
                // new_sm = new Soil('0m', data["data"][geographic_num]["wns"]);
                // new_sm100 = new Soil('100m', data["data"][geographic_num]["wns_100m"]);
                // new_gust = new Soil('gust', data["data"][geographic_num]["gust"]);
                // sm_data.push(new_sm);
                // sm_data.push(new_sm100);
                // sm_data.push(new_gust);

                // new_dir = new Soil('0m', data["data"][geographic_num]["wnd"]);
                // new_dir100 = new Soil('100m', data["data"][geographic_num]["wnd_100m"]);
                // dir_data.push(new_dir);
                // dir_data.push(new_dir100);
                // drawBar(sm_data,"left", "wnd");
                // drawBar(dir_data, "right", "wnd_100m");


                // let u_data = [];
                // let v_data = [];
                // let new_u, new_v, new_100_u, new_100_v;
                // new_u = new Soil('0m', math.abs(data["data"][geographic_num]["u"]));
                // new_100_u = new Soil('100m', math.abs(data["data"][geographic_num]["u_100"]));
                // u_data.push(new_u);
                // u_data.push(new_100_u);

                // new_v = new Soil('0m', math.abs(data["data"][geographic_num]["u"]));
                // new_100_v = new Soil('100m', math.abs(data["data"][geographic_num]["u_100"]));
                // v_data.push(new_v);
                // v_data.push(new_100_v);
                // drawBar(u_data,"left", "u");
                // drawBar(v_data, "right", "v");




            }).on("mouseout", function (d) {
                d3.select(this)
                    .attr("fill", ss2[7]);
                if (map_end !== undefined){
                    let geographic_data = d3.select(this).data()[0]
                    d3.select(this)
                        .attr("fill", show_ecological_color(geographic_data, map_end, data));
                }
                // d3.select('svg').selectAll("text").remove();
                d3.selectAll('.bars').remove();
                d3.selectAll('#tag').remove();
            });
        }
    });
}
class Soil {
    constructor(name, num) {
        this.name = name;
        this.num = num;
    }
}
var SVG_container_r = d3.select("#test-bar")
    .append('svg')
    .attr('width', 250 + 'px')
    .attr('height', 300 + 'px')
    .attr('class', 'title');
var SVG_container_l = d3.select("#test-bar")
    .append('svg')
    .attr('width', 250 + 'px')
    .attr('height', 300 + 'px')
    .attr('class', 'title');

// var SVG_container_u = d3.select("#wind-uv")
//     .append('svg')
//     .attr('width', 250 + 'px')
//     .attr('height', 300 + 'px')
//     .attr('class', 'title');
// var SVG_container_v = d3.select("#wind-uv")
//     .append('svg')
//     .attr('width', 250 + 'px')
//     .attr('height', 300 + 'px')
//     .attr('class', 'title');

var SVG_container_tem = d3.select("#tem_rhu-bar1")
    .append('svg')
    .attr('width', 250 + 'px')
    .attr('height', 300 + 'px')
    .attr('class', 'title');
var SVG_container_rhu = d3.select("#tem_rhu-bar1")
    .append('svg')
    .attr('width', 250 + 'px')
    .attr('height', 300 + 'px')
    .attr('class', 'title');
function drawBar(data, title_location, map_end) {

    let x = d3.scaleBand()
        .range([0, 100])
        .domain(data.map(function (d) { return d.name; }))
        .padding(0.2);
    let add_x = 0;
    let add_y = 0;
// check whether for soil temprature or moisture data is passed
    if(title_location === "left"){
        let y, fill_color;
        var SVG_container;
        if (map_end === "rhu"){
            y = d3.scaleLinear()
                .domain([0, 70])
                .range([200, 0]);
            fill_color = "#87CEFA";
            // SVG_container = SVG_container_rhu;
            // X axis
            SVG_container_rhu.append("g")
                .attr("class", "bars")
                .style("padding", 10)
                .attr("transform", "translate(50," + 250 + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("class", "bars")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

//  Y axis
            SVG_container_rhu.append("g")
                .attr("class", "bars")
                .style("padding", 5)
                .attr("transform", "translate(" + 50 + ",50)")
                .call(d3.axisLeft(y))
                .selectAll("text")
                .attr("class", "bars")
                .attr("transform", "translate(-10,0)")
                .style("text-anchor", "end")

            d3.select(".title")
                .append("text")
                .attr("x",354)
                .attr("y",75)
                .attr("transform", "translate(100,100)")


// Bars
            SVG_container_rhu.selectAll("mybar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bars")
                .attr("x", function (d) { return 50 + x(d.name); })
                .attr("y", function (d) { return y(d.num) + 50; })
                .attr("width", x.bandwidth())
                .attr("height", function (d) { return 200 - y(d.num); })
                .attr("fill", fill_color)
        }
        if (map_end === "wnd"){
            y = d3.scaleLinear()
                .domain([0, 10])
                .range([200, 0]);
            fill_color = "#22c32e";
            // SVG_container = SVG_container_l;
            // X axis
            SVG_container_l.append("g")
                .attr("class", "bars")
                .style("padding", 10)
                .attr("transform", "translate(50," + 250 + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("class", "bars")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

//  Y axis
            SVG_container_l.append("g")
                .attr("class", "bars")
                .style("padding", 5)
                .attr("transform", "translate(" + 50 + ",50)")
                .call(d3.axisLeft(y))
                .selectAll("text")
                .attr("class", "bars")
                .attr("transform", "translate(-10,0)")
                .style("text-anchor", "end")

            d3.select(".title")
                .append("text")
                .attr("x",354)
                .attr("y",75)
                .attr("transform", "translate(100,100)")


// Bars
            SVG_container_l.selectAll("mybar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bars")
                .attr("x", function (d) { return 50 + x(d.name); })
                .attr("y", function (d) { return y(d.num) + 50; })
                .attr("width", x.bandwidth())
                .attr("height", function (d) { return 200 - y(d.num); })
                .attr("fill", fill_color)

        }
        if (map_end === "u"){
            y = d3.scaleLinear()
                .domain([0, 10])
                .range([200, 0]);
            fill_color = "#22c32e";
            // SVG_container = SVG_container_u;
            // X axis
            SVG_container_u.append("g")
                .attr("class", "bars")
                .style("padding", 10)
                .attr("transform", "translate(50," + 250 + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("class", "bars")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

//  Y axis
            SVG_container_u.append("g")
                .attr("class", "bars")
                .style("padding", 5)
                .attr("transform", "translate(" + 50 + ",50)")
                .call(d3.axisLeft(y))
                .selectAll("text")
                .attr("class", "bars")
                .attr("transform", "translate(-10,0)")
                .style("text-anchor", "end")

            d3.select(".title")
                .append("text")
                .attr("x",354)
                .attr("y",75)
                .attr("transform", "translate(100,100)")


// Bars
            SVG_container_u.selectAll("mybar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bars")
                .attr("x", function (d) { return 50 + x(d.name); })
                .attr("y", function (d) { return y(d.num) + 50; })
                .attr("width", x.bandwidth())
                .attr("height", function (d) { return 200 - y(d.num); })
                .attr("fill", fill_color)
        }
    }
    if(title_location === "right"){
        let y, fill_color;
        var SVG_container1;
        if (map_end === "tem"){
            y = d3.scaleLinear()
                .domain([0, 45])
                .range([200, 0]);
            fill_color = "#DC143C";
            // SVG_container1 = SVG_container_tem;
            // X axis
            SVG_container_tem.append("g")
                .attr("class", "bars")
                .style("padding", 10)
                .attr("transform", "translate(50," + 250 + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("class", "bars")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

//  Y axis
            SVG_container_tem.append("g")
                .attr("class", "bars")
                .style("padding", 5)
                .attr("transform", "translate(" + 50 + ",50)")
                .call(d3.axisLeft(y))
                .selectAll("text")
                .attr("class", "bars")
                .attr("transform", "translate(-10,0)")
                .style("text-anchor", "end")

            d3.select(".title")
                .append("text")
                .attr("x",354)
                .attr("y",75)
                .attr("transform", "translate(100,100)")


// Bars
            SVG_container_tem.selectAll("mybar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bars")
                .attr("x", function (d) { return 50 + x(d.name); })
                .attr("y", function (d) { return y(d.num) + 50; })
                .attr("width", x.bandwidth())
                .attr("height", function (d) { return 200 - y(d.num); })
                .attr("fill", fill_color)
        }
        if (map_end === "wnd_100m"){
            y = d3.scaleLinear()
                .domain([0, 360])
                .range([200, 0]);
            fill_color = "#22c32e";
            // SVG_container1 = SVG_container_r;
            // X axis
            SVG_container_r.append("g")
                .attr("class", "bars")
                .style("padding", 10)
                .attr("transform", "translate(50," + 250 + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("class", "bars")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

//  Y axis
            SVG_container_r.append("g")
                .attr("class", "bars")
                .style("padding", 5)
                .attr("transform", "translate(" + 50 + ",50)")
                .call(d3.axisLeft(y))
                .selectAll("text")
                .attr("class", "bars")
                .attr("transform", "translate(-10,0)")
                .style("text-anchor", "end")

            d3.select(".title")
                .append("text")
                .attr("x",354)
                .attr("y",75)
                .attr("transform", "translate(100,100)")


// Bars
            SVG_container_r.selectAll("mybar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bars")
                .attr("x", function (d) { return 50 + x(d.name); })
                .attr("y", function (d) { return y(d.num) + 50; })
                .attr("width", x.bandwidth())
                .attr("height", function (d) { return 200 - y(d.num); })
                .attr("fill", fill_color)
        }
        if (map_end === "v"){
            y = d3.scaleLinear()
                .domain([0, 10])
                .range([200, 0]);
            fill_color = "#22c32e";
            // SVG_container1 = SVG_container_v;
            // X axis
            SVG_container_v.append("g")
                .attr("class", "bars")
                .style("padding", 10)
                .attr("transform", "translate(50," + 250 + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("class", "bars")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

//  Y axis
            SVG_container_v.append("g")
                .attr("class", "bars")
                .style("padding", 5)
                .attr("transform", "translate(" + 50 + ",50)")
                .call(d3.axisLeft(y))
                .selectAll("text")
                .attr("class", "bars")
                .attr("transform", "translate(-10,0)")
                .style("text-anchor", "end")

            d3.select(".title")
                .append("text")
                .attr("x",354)
                .attr("y",75)
                .attr("transform", "translate(100,100)")


// Bars
            SVG_container_v.selectAll("mybar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bars")
                .attr("x", function (d) { return 50 + x(d.name); })
                .attr("y", function (d) { return y(d.num) + 50; })
                .attr("width", x.bandwidth())
                .attr("height", function (d) { return 200 - y(d.num); })
                .attr("fill", fill_color)
        }
    }


}

var range_change;
function myFunctionBack() {
    range_change = 1;
    click();
}
var elem = document.querySelector('input[type="range"]');

var rangeValue = function () {
    var test_day = $('#day option:selected').val();
    if (test_day === "1") test_day = "2021-07-22 ";
    if (test_day === "2") test_day = "2021-07-23 ";
    if (test_day === "3") test_day = "2021-07-24 ";
    if (test_day === "4") test_day = "2021-07-25 ";
    if (test_day === "5") test_day = "2021-07-26 ";
    if (test_day === "6") test_day = "2021-07-27 ";

    var newValue = elem.value;
    var target = document.querySelector('.value');
    target.innerHTML = test_day + newValue + ":00";
}

elem.addEventListener("input", rangeValue);
