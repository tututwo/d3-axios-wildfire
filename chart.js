async function drawChart() {

  // 1. Access data
  const dataset = await d3.csv("fire.csv")

  const data = Array.from(d3.group(dataset, d => +d.start_year)).map(
    ([year, data_fire]) => {return {year, data_fire}}
  )


  // 2. Create chart dimensions

  let dimensions = {
    width: window.innerWidth * 0.8,
    height: 800,
    margin: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 360,
    },
  }
  dimensions.boundedWidth = dimensions.width
    - dimensions.margin.left
    - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height
    - dimensions.margin.top
    - dimensions.margin.bottom

  // 3. Draw canvas
  const wrapper = d3.select("#wrapper")
    .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)

  const bounds = wrapper.append("g")
      .style("transform", `translate(${
        dimensions.margin.left
      }px, ${
        dimensions.margin.top
      }px)`)

  // 4. Create scales
  const spike = (spikeeight, spikeWidth = 12) => `M${-spikeWidth / 2},0 L0,${-spikeeight} L${spikeWidth / 2},0`
//TODO 这个改成log什么的，反正不能是线性
  const spikeHeight = d3.scaleSqrt([0, 150000], [0, dimensions.boundedHeight/18])

  const spikeColor = d3.scaleThreshold()
                      .domain([10, 20, 40, 60, 120])
                      .range(["#ffd7b2", "#ffb87e","#ff7920", "#f35d00", "#d44b01"])
//TODO 这得让每年都是十二个月，来对应
  const year2year = d3.scaleTime()
                    .domain([new Date("2000-01-01"), new Date("2017-12-30")])
                    .range([new Date("2000-01-01"), new Date("2000-12-30")])
  const timeScale = d3.scaleTime()
                      .domain([new Date("2000-01-01"), new Date("2000-12-30")])
                      .rangeRound([0, dimensions.boundedWidth])
 
  // 5. Draw data
      // <svg><g>第一个g</g></svg>
  const triangle = bounds.append('g')
        .selectAll('g')
        .data(data) // this will have only 4 elements in it
        .join('g')
        //? you cant use attr here, why???
          .style("transform", (d, i) => `translateY(${
              dimensions.boundedHeight/18* (i+1)
            }px)`)
          .style('isolation', "isolate")


  const fire_path = triangle.selectAll("path")
        .data(d => d.data_fire)
        .join("path")
          .attr('class', "fire")
          .style("transform", d => `translateX(${
              timeScale(new Date(d.map_date))
            }px)`)
          .attr("d", (d) => spike(spikeHeight(d.acres), 12))
          .attr('fill', d => spikeColor(d.duration))
          .style('opacity', 0.8)
          // .attr("stroke", d => spikeColor(d.duration))
          .style("mix-blend-mode", "screen")
  
  fire_path.on("mouseover", onMouseEnter)
           .on('mouseleave', onMouseLeave)


            
  


  // 6. Draw peripherals

 

  // 7. Interaction
  const nameAccessor = d => d.name
  const acreAccessor = d => d.acres
  // text
  const tooltip_text = triangle.append('g')
          .attr('class', 'text')
  const fire_name = tooltip_text.append('text')
          .attr('x',0)
          .attr('y',-20)
  const acre_number = tooltip_text.append('text')
          .attr('x',0)
          .attr('y',-6)
  

  function onMouseEnter(event,d) {
    //draw the path to emphasize
    // dim the fill


    // add class: active to the tooltip_text
    // only show what is active
    const tooltip = d3.select(event.currentTarget.parentNode)
      .select('.text')
      .classed('active', true)
      .style('opacity', 1)

    const text = event.currentTarget.parentNode.getElementsByTagName('text')
    // attach fire_name
    d3.select(text[0])
      .text(nameAccessor(d))
    d3.select(text[1])
      .text(acreAccessor(d))
    
    // transfrom tooltip_text
    d3.selectAll('.text.active')
      .style('transform', `translate(${timeScale(new Date(d.map_date))}px,
                                     ${spikeHeight(d.acres)-30}px)`)

    
  }

  function onMouseLeave(){
    d3.selectAll('.text.active')
      .style('opacity', 0)
  }
}


drawChart()
