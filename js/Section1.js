// import {map} from "./d3";

// import {map} from "./d3";

let width = 1100,
  height = 600;

let svg = d3
  .select("#test-svg")
  .append("svg")
  .attr("width", width + "px")
  .attr("height", height + "px");

/**
 * define map projection
 * Automatically scale the map to the center of the svg according to the size of the svg
 */
let projection = d3.geoMercator().fitSize([width, height], qinling);

let features = qinling.features;

// Project in an adaptive way，The data type of features is geojson, and existing data may need to be processed
// const projection = d3.geoMercator().fitSize([width, height], features);
let path = d3.geoPath().projection(projection);
// color in the map
let ss2 = d3.schemeSet2;
let sp2 = d3.schemePastel2;
let regions = svg
  .append("g")
  .attr("class", "map")
  .selectAll(".china")
  .data(features)
  .join("path")
  .attr("class", "china")
  .attr("fill", ss2[7])
  .attr("d", path)
  .attr("stroke", "white")
  .attr("stroke-width", 0.3)
  .on("mouseover", function (d, i) {
    d3.select(this).attr("fill", ss2[6]);
  })
  .on("mouseout", function (d, i) {
    d3.select(this).attr("fill", ss2[7]);
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
        d3.select(this).attr("fill", ss2[6]);
        /**
         * 在未选择具体的气候特征图时，保证基本的tooltip等功能
         */
        let show_infor = svg
          .append("g")
          .attr("class", "infor_text")
          .style("z-index", -1);
        let geographic_data = d3.select(this).data()[0]["properties"]["省C"];
        let geographic_name = geographic_data[1];
        let coordinate = projection(
          d3.select(this).data()[0]["geometry"]["coordinates"][0][0]
        );
        let text = show_infor
          .selectAll("text")
          .data(geographic_name)
          .join("text")
          .attr("id", "tag")
          .attr("x", function (d) {
            if (coordinate[0] > 325) {
              return coordinate[0] - 60;
            } else {
              return coordinate[0] + 60;
            }
          })
          .attr("y", function (d) {
            if (coordinate[1] > 325) {
              return coordinate[1] - 60;
            } else {
              return coordinate[1] + 60;
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
            return (
              "translate(" +
              (size.width / 2 + 5) +
              "," +
              size.height * (i + 1) +
              ")"
            );
          });
        d3.selectAll("text").insert("g", "#tag");
      })
      .on("mouseout", function (d) {
        d3.select(this).attr("fill", ss2[7]);
        // d3.select('svg').selectAll("text").remove();
        d3.selectAll("#tag").remove();
      });
  },
});

var weather_json_file_path;
function click() {
  /**
   * 确保点击秦岭地图时，刷新显示
   */
  let weather_json_file_name;
  let map_end;
  $(document).ready(function () {
    let day = $("#day option:selected").val();
    let time = $("#time option:selected").val();
    let map = $("#map option:selected").val();
    if (day === "") {
      alert(
        "Please select one day and time before choosing a region on the map."
      );
      return false;
    }

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

    if (range_change === 1) {
      var d = jQuery(".value").html();
      time = parseInt(d.slice(11, d.length), 10);
      if (time < 10) time = "0" + time;
      // range_change = 0;
    }

    if (map === "1") map_end = "tem";
    if (map === "2") map_end = "rhu";
    if (map === "3") map_end = "pre";
    if (map === "4") map_end = "vis";
    if (map === "5") map_end = "prs";

    weather_json_file_name = day + time + ".json"; //instantiate variable for reading file
    weather_json_file_path = "data_all/" + "data/" + weather_json_file_name;
    if (map !== "") {
      $.ajax({
        type: "get",
        url: weather_json_file_path,
        dataType: "json",
        // data file path
        success: function (data) {
          // changing color when the mouse hovers
          // d3.selectAll("#arrow_id").remove();
          d3.select("svg").selectAll("text").remove();
          d3.select("svg").selectAll(".win").remove();
          // d3.selectAll("#arrow_id").remove();
          let regions1 = svg
            .append("g")
            .attr("class", "map")
            .selectAll(".china")
            .data(features)
            .join("path")
            .attr("class", "china")
            .attr("fill", function (d) {
              return show_ecological_color(d, map_end, data);
            })
            .attr("d", path)
            .attr("stroke", "white")
            .attr("stroke-width", 0.3)
            // .on("click", click);
          show_ecological_data(weather_json_file_path, regions1, map_end);
          // show_ssrd(data);
        }
      });
    }

    show_ecological_data(weather_json_file_path, regions, map_end);
  });
}

function show_ssrd(){
  if (weather_json_file_path == undefined){
    alert(
        "Please select one day, time and map before showing total solar irradiance points on the map.");
    return false;
  }
  $.ajax({
    type: "get",
    url: weather_json_file_path,
    dataType: "json",
    // data file path
    success: function (data) {
      // changing color when the mouse hovers
      // d3.selectAll("#arrow_id").remove();
      d3.select("svg").selectAll("text").remove();
      d3.select("svg").selectAll(".win").remove();
      //solar irradiance
      let ssrdScale = d3
          .scaleLinear()
          .domain([
            d3.min(data.data, function (d) {
              return d.ssrd;
            }),
            d3.max(data.data, function (d) {
              return d.ssrd;
            }),
          ])
          .range([0, 1]);

      let ssrdToRaduis = d3
          .scaleLinear()
          .domain(
              d3.extent(data.data, function (d) {
                return + d.ssrd;
              })
          )
          .range([5, 10]);

      let ssrdToBlur = d3
          .scaleLinear()
          .domain(
              d3.extent(data.data, function (d) {
                return + d.ssrd;
              })
          )
          .range([3, 10]);

      let circles = svg
          .append("g")
          .attr("class", "cir")
          .attr("class", "blink")
          .selectAll(".win")
          .data(features)
          .join("circle")
          .attr("class", "win")
          .style("filter", (d) => "blur(" + ssrdToBlur(d.ssrd) + "px)")
          .style("filter", "blur(3px)")
          //   .attr("r", 10)
          .attr("fill", "#DCDCDC")
          .attr("transform", (d) => `translate(${path.centroid(d)})`)
          .attr("fill", function (d) {
            let regionId = d3.select(this).data()[0]["properties"]["省C"][0];

            var value = data.data[regionId].ssrd;

            if (value) {
              //   return d3.interpolateWarm(ssrdScale(value));
              return d3.interpolateOrRd(ssrdScale(value));
            } else {
              return "#cccc";
            }
          })
          .attr("r", function (d) {
            let regionId = d3.select(this).data()[0]["properties"]["省C"][0];

            var value = data.data[regionId].ssrd;

            if (value) {
              return ssrdToRaduis(value);
            } else {
              return 1;
            }
          })
          .attr("opacity", "1");
    }
  });
}

function show_ecological_color(d, name, data) {
  /**
   *根据当前选中的需要显示的气候特征图，改变秦岭图各个区域的显示颜色
   */
  let show_name;
  if (name === "rhu") {
    show_name = "Relative humidity";
    let color = d3
      .scaleThreshold()
      .domain(d3.range(2, 10))
      .range(d3.schemeBlues[9]);
    let real_map = d3.range(68, 100, 4);
    let sign = "%";
    show_map_color(
      color,
      show_name,
      real_map,
      sign,
      data["data"][d["properties"]["省C"][0]]["date"]
    );

    // update qingling map
    let rhu_color = d3
      .scaleThreshold()
      .domain(d3.range(68, 100, 4))
      .range(d3.schemeBlues[9]);
    let geographic_rhu = data["data"][d["properties"]["省C"][0]]["rhu"];
    return rhu_color(geographic_rhu);
  }
  if (name === "tem") {
    // draw color map(num to color)
    show_name = "Temperature";
    let color = d3
      .scaleThreshold()
      .domain(d3.range(2, 10))
      .range(d3.schemeReds[9]);
    let real_map = d3.range(11, 35, 3);
    let sign = "°C";
    show_map_color(
      color,
      show_name,
      real_map,
      sign,
      data["data"][d["properties"]["省C"][0]]["date"]
    );

    // update qingling map
    let rhu_color = d3
      .scaleThreshold()
      .domain(d3.range(11, 35, 3))
      .range(d3.schemeReds[9]);
    let geographic_tem = data["data"][d["properties"]["省C"][0]]["tem"];
    return rhu_color(geographic_tem);
  }
  if (name === "pre") {
    // draw color map(num to color)
    show_name = "Precipitation";
    let color = d3
        .scaleThreshold()
        .domain(d3.range(2, 10))
        .range(d3.schemeBlues[9]);
    let real_map = d3.range(0, 8, 1);
    let sign = "mm";
    show_map_color(
        color,
        show_name,
        real_map,
        sign,
        data["data"][d["properties"]["省C"][0]]["date"]
    );

    // update qingling map
    let rhu_color = d3
        .scaleThreshold()
        .domain(d3.range(0, 8, 1))
        .range(d3.schemeBlues[9]);
    let geographic_tem = data["data"][d["properties"]["省C"][0]]["pre"];
    return rhu_color(geographic_tem);
  }
  if (name === "vis") {
    // draw color map(num to color)
    show_name = "Visibility";
    let range_color = ["#000000","#252525","#525252","#737373","#969696", "#bdbdbd", "#d9d9d9", "#f0f0f0", "#ffffff"];
    let color = d3
        .scaleThreshold()
        .domain(d3.range(2, 10))
        .range(range_color);
    let real_map = d3.range(1, 33, 4);
    let sign = "km";
    show_map_color(
        color,
        show_name,
        real_map,
        sign,
        data["data"][d["properties"]["省C"][0]]["date"]
    );
    // update qingling map
    let rhu_color = d3
        .scaleThreshold()
        .domain(d3.range(1, 33, 4))
        .range(range_color);
    let geographic_vis = data["data"][d["properties"]["省C"][0]]["vis"] / 1000;
    return rhu_color(geographic_vis);
  }
  if (name === "prs") {
    // draw color map(num to color)
    show_name = "Barometric pressure";
    let color = d3
        .scaleThreshold()
        .domain(d3.range(2, 10))
        .range(d3.schemeGreens[9]);
    let real_map = d3.range(800, 1200, 50);
    let sign = "hPa";
    show_map_color(
        color,
        show_name,
        real_map,
        sign,
        data["data"][d["properties"]["省C"][0]]["date"]
    );

    // update qingling map
    let rhu_color = d3
        .scaleThreshold()
        .domain(d3.range(800, 1200, 50))
        .range(d3.schemeGreens[9]);
    let geographic_tem = data["data"][d["properties"]["省C"][0]]["prs"];
    return rhu_color(geographic_tem);
  }

}

function show_map_color(color, name, real_map, sign, date) {
  /**
   *根据当前显示的气候特征图，输出颜色深度与气候特征数的对应关系，并在右下角显示
   */
  d3.selectAll("#color_rect_id").remove();
  d3.selectAll("#captions_id").remove();
  d3.selectAll("#color_domain_id").remove();
  let x = d3.scaleLinear().domain([1, 10]).rangeRound([600, 860]);
  let color_rect = svg
    .append("g")
    .attr("class", "key")
    .attr("id", "color_rect_id")
    .attr("transform", "translate(170,520)");

  color_rect
    .selectAll("rect")
    .data(
      color.range().map(function (d) {
        d = color.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
      })
    )
    .enter()
    .append("rect")
    .attr("height", 8)
    .attr("x", function (d) {
      return x(d[0]);
    })
    .attr("width", function (d) {
      return x(d[1]) - x(d[0]);
    })
    .attr("fill", function (d) {
      return color(d[0]);
    });

  d3.selectAll("color_rect").insert("g", "#color_rect_id");

  let captions = svg
    .append("g")
    .attr("class", "caption_text")
    .attr("id", "captions_id")
    .attr("transform", "translate(170,520)");
  captions
    .append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text(name);
  d3.selectAll("captions").insert("g", "#captions_id");

  let color_domain = svg
    .append("g")
    .attr("class", "color_domain")
    .attr("id", "color_domain_id")
    .attr("transform", "translate(170,520)");
  color_domain
    .call(
      d3
        .axisBottom(x)
        .tickSize(13)
        .tickFormat(function (x, i) {
          if (i === 0) return real_map[i] + sign;
          return real_map[i];
          // return i ? x : x + "%";
        })
        .tickValues(color.domain())
    )
    .select(".domain")
    .remove();
  d3.selectAll("captions").insert("g", "#color_domain_id");
  let real_time;
  if (date.slice(-2) < "12") real_time = date.slice(-2) + ":00:00" + " a.m";
  if (date.slice(-2) === "12") real_time = date.slice(-2) + ":00:00" + " noon";
  if (date.slice(-2) > "12") real_time = date.slice(-2) + ":00:00" + " p.m";
  real_time = real_time + " on July " + date.slice(-4, -2) + ", 2021";
  if (name === "Wind Speed")
    real_time = real_time + " " + "0m Wind" + " " + "Reigonal" + " map";
  else if (name === "100m wind Speed")
    real_time = real_time + " " + "100m Wind" + " " + "Reigonal" + " map";
  else {
    // d3.selectAll('#arrow_id').remove();
    real_time = real_time + " " + name + " " + "Reigonal" + " map";
  }
  document.getElementById("new-time").innerHTML =
    '<span id="show_day">' + real_time + "<br></span>";
}

function show_ecological_data(weather_json_file_path, regions, map_end) {
  $.ajax({
    type: "get",
    url: weather_json_file_path,
    dataType: "json",
    // data file path
    success: function (data) {
      // changing color when the mouse hovers
      regions
        .on("mouseover", function (d) {
          d3.select(this).attr("fill", ss2[6]);
          /**
           *读取鼠标当前选中区域，并根据相应的json文件输出当前区域的气候特征，包括温度，湿度，风力等
           */
          let show_infor = svg
            .append("g")
            .attr("class", "infor_text")
            .style("z-index", -1);
          let geographic_data = d3.select(this).data()[0]["properties"]["省C"];
          let geographic_name;
          if (map_end !== undefined){
            let geographic_num = geographic_data[0];
            let geographic_element;
            if (map_end === "tem"){
              let geographic_element1 = 'Temperature:' + (data["data"][geographic_num]["tem"]).toFixed(2) + "°C";
              let geographic_element2 = 'Surface temperature:' + (data["data"][geographic_num]["skt"]).toFixed(2) + "°C";
              let geographic_element3 = 'Total solar irradiance:' + (data["data"][geographic_num]["ssrd"]).toFixed(2) + "kWh/m^2";
              let geographic_element4 = 'Ultraviolet UV irradiance:' + (data["data"][geographic_num]["uvb"]).toFixed(2) + "kWh/m^2";
              let geographic_element12 = Array.prototype.concat(geographic_element1, geographic_element2);
              let geographic_element34 = Array.prototype.concat(geographic_element3, geographic_element4);
              geographic_element = Array.prototype.concat(geographic_element12, geographic_element34);
            }
            if (map_end === "rhu") geographic_element= 'Humanity:' + (data["data"][geographic_num]["rhu"]).toFixed(2) + "%";
            if ((map_end === "pre")) geographic_element= 'Precipitation:' + (data["data"][geographic_num]["pre"]).toFixed(2) + "mm";
            if ((map_end === "vis")) geographic_element= 'Visibility:' + (data["data"][geographic_num]["vis"] / 1000).toFixed(2) + "km";
            if ((map_end === "prs")) geographic_element= 'Barometric pressure:' + (data["data"][geographic_num]["prs"]).toFixed(2) + "hPa";
            geographic_name = Array.prototype.concat(geographic_data[1], geographic_element);
          }
          else{
            geographic_name = geographic_data[1];
          }
          let coordinate = projection(
            d3.select(this).data()[0]["geometry"]["coordinates"][0][0]
          );
          let text = show_infor
            .selectAll("text")
            .data(geographic_name)
            .join("text")
            .attr("id", "tag")
            .attr("x", function (d) {
              if (coordinate[0] > 425) {
                return coordinate[0] - 340;
              } else {
                return coordinate[0] + 30;
              }
            })
            .attr("y", function (d) {
              if (coordinate[1] > 325) {
                return coordinate[1] - 90;
              } else {
                return coordinate[1] + 70;
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
              return (
                "translate(" +
                (size.width / 2 + 5) +
                "," +
                size.height * (i + 1) +
                ")"
              );
            });
          d3.selectAll("text").insert("g", "#tag");
          /**
           * 输出到框中
           */
          // let array1 = data
          let geographic_num = geographic_data[0];
          let geographic_weather = data["data"][geographic_num];
          $('#temperature').val('Temperature:'+ (geographic_weather["tem"]).toFixed(2) + '°C');
          $('#surface_temperature').val('Surface temperature:'+ (geographic_weather["skt"]).toFixed(2) + "°C");
          $('#Relative_humidity').val('Relative humidity:'+ geographic_weather["rhu"].toFixed(2) + '%');
          $('#Precipitation').val('Precipitation:'+ geographic_weather["pre"].toFixed(2) + 'mm');
          $('#Visibility').val('Visibility:'+ (geographic_weather["vis"] / 1000).toFixed(2) + 'km');
          $('#Barometric_pressure').val('Barometric pressure:'+ geographic_weather["prs"].toFixed(2) + 'hPa');
          $('#ssrd').val('Total solar irradiance:'+ geographic_weather["ssrd"].toFixed(2) + 'kWh/m^2');
          $('#uvb').val('Ultraviolet UV irradiance:'+ geographic_weather["uvb"].toFixed(2) + 'kWh/m^2');
          $('#cloud').val('Cloud coverage:'+ geographic_weather["clo"].toFixed(2) + '%');

          let new_clo = data["data"][geographic_num]["clo"];
          let new_rhu = data["data"][geographic_num]["rhu"];
          d3.selectAll(".rmv").remove();
          pieChart("#my_cloviz", new_clo);
          pieChart("#my_rhuviz", new_rhu);

          d3.selectAll("chart").remove();
          let temp_data = []
          let tem = new Soil('tem', data["data"][geographic_num]["tem"]);
          let skt = new Soil('skt', data["data"][geographic_num]["skt"]);
          temp_data.push(tem)
          temp_data.push(skt)
          drawBar2(temp_data);
        })
        .on("mouseout", function (d) {
          d3.select(this).attr("fill", ss2[7]);
          if (map_end !== undefined) {
            let geographic_data = d3.select(this).data()[0];
            d3.select(this).attr(
              "fill",
              show_ecological_color(geographic_data, map_end, data)
            );
          }
          // d3.select('svg').selectAll("text").remove();
          d3.selectAll(".bars").remove();
          d3.selectAll("#tag").remove();
          d3.selectAll(".rmv").remove();
        })
        .on("click", function (d) {
          //console.log(this)
          d3.select(this).attr("stroke", "yellow");

          let regionId = d3.select(this).data()[0]["properties"]["省C"][0];

          var new_clo = data.data[regionId].clo;
          var new_rhu = data.data[regionId].rhu;
          // console.log(val_rhu)

          // d3.selectAll('.rmv').remove();
          // pieChart("#my_cloviz", new_clo);

          // pieChart("#my_rhuviz", new_rhu);
          // d3.selectAll('#my_cloviz').remove();
        });
    },
  });
}
class Soil {
  constructor(name, num) {
    this.name = name;
    this.num = num;
  }
}

function pieChart(cls, val) {
  // set the dimensions and margins of the graph
  const width = 350,
    height = 350,
    margin = 20;

  // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
  const radius = Math.min(width, height) / 2 - margin;

  // append the svg object to the div called 'my_dataviz'
  const svg = d3
    .select(cls)
    .append("svg")
    .attr("class", "rmv")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Create dummy data
  const data = { a: 0, b: 100 };
  data["a"] = val;
  data["b"] = 100 - val;
  const color = d3.scaleOrdinal().range(["#1E90FF", "#98abc5"]);
  b = "#my_cloviz";
  if (cls == b) {
    const color = d3.scaleOrdinal().range(["#B0E0E6", "#cccccc"]);
  }

  // Compute the position of each group on the pie:
  const pie = d3
    .pie()
    .sort(null) // Do not sort group by size
    .value((d) => d[1]);
  const data_ready = pie(Object.entries(data));

  // The arc generator
  const arc = d3
    .arc()
    .innerRadius(radius * 0.5) // This is the size of the donut hole
    .outerRadius(radius * 0.8);

  // Another arc that won't be drawn. Just for labels positioning
  const outerArc = d3
    .arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  svg
    .selectAll("allSlices")
    .data(data_ready)
    .join("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data[1]))
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 0.7);

  // Add the polylines between chart and labels:
  svg
    .selectAll("allPolylines")
    .data(data_ready)
    .join("polyline")
    .attr("stroke", "black")
    .style("fill", "none")
    .attr("stroke-width", 1)
    .attr("points", function (d) {
      const posA = arc.centroid(d); // line insertion in the slice
      const posB = outerArc.centroid(d); // line break: we use the other arc generator that has been built only for that
      const posC = outerArc.centroid(d); // Label position = almost the same as posB
      const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2; // we need the angle to see if the X position will be at the extreme right or extreme left
      posC[0] = radius * 0.85 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
      return [posA, posB, posC];
    });

  // Add the polylines between chart and labels:
  svg
    .selectAll("allLabels")
    .data(data_ready)
    .join("text")
    .text((d) => d.data[1].toFixed(2))
    .attr("transform", function (d) {
      const pos = outerArc.centroid(d);
      const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      pos[0] = radius * 0.9 * (midangle < Math.PI ? 1 : -1);
      return `translate(${pos})`;
    })
    .style("text-anchor", function (d) {
      const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      return midangle < Math.PI ? "start" : "end";
    })
    .attr("style", "font-size:15px");
}


var bar_svg = d3.select("#my_temviz")
    .append('svg')
    .attr('width', 500 + 'px')
    .attr('height', 300 + 'px')
function drawBar2(data) {

  // X axis
  var x = d3
    .scaleBand()
    .range([0, 200])
    .domain(
      data.map(function (d) {
        return d.name;
      })
    )
    .padding(0.2);


  bar_svg
    .append("g")
    .attr("class", "bars")
    .style("padding", 10)
    .attr("transform", "translate(50," + 250 + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("class", "bars")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Add Y axis
  var y = d3.scaleLinear().domain([10, 35]).range([200, 0]);

  bar_svg
    .append("g")
    .attr("class", "bars")
    .style("padding", 5)
    .attr("transform", "translate(" + 50 + ",50)")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .attr("class", "bars")
    .attr("transform", "translate(-10,0)")
    .style("text-anchor", "end");

    barColor = d3.scaleLinear()
    .domain([ 10,30,40 ]).range([ "#06c3d1","#FFFF00", "#d1383c"]);


       // Bars
       bar_svg.selectAll("mybar")
       .data(data)
       .enter()
       .append("rect")
       .attr("class", "bars")
       .attr("x", function (d) {
         return 50 + x(d.name);
       })
       .attr("y", function (d) {
         return y(d.num) + 50;
       })
       .attr("width", x.bandwidth())
       .attr("height", function (d) {
        return 200 - y(d.num);
      })
       .attr("fill",  function (d) {
        return  barColor(d.num);
      })

}

var range_change;
function myFunctionBack() {
  range_change = 1;
  click();
}
var elem = document.querySelector('input[type="range"]');

var rangeValue = function () {
  var test_day = $("#day option:selected").val();
  if (test_day === "1") test_day = "2021-07-22 ";
  if (test_day === "2") test_day = "2021-07-23 ";
  if (test_day === "3") test_day = "2021-07-24 ";
  if (test_day === "4") test_day = "2021-07-25 ";
  if (test_day === "5") test_day = "2021-07-26 ";
  if (test_day === "6") test_day = "2021-07-27 ";

  var newValue = elem.value;
  var target = document.querySelector(".value");
  target.innerHTML = test_day + newValue + ":00";
};

elem.addEventListener("input", rangeValue);
