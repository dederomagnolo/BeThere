import React from 'react';
import { ResponsiveLine } from '@nivo/line'; 
import { GraphContainer } from './styles';

export const Graph = ({chartData}) => {
    
    const renderChartLabel = () => {
        return chartData.length > 0 && (chartData[0].id).includes('Temperatura') ? "°C" : "%";
    }

    return (
        <GraphContainer>
            <ResponsiveLine
                data={chartData}
                margin={{ top: 10, right: 30, bottom: 80, left: 60 }}
                xScale={{ type: 'point', stacked: true }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    orient: 'bottom',
                    tickSize: 10,
                    tickPadding: 5,
                    tickRotation: 80,
                    legendOffset: 20,
                    legendPosition: 'middle',
                }}
                curve="monotoneX"
                axisLeft={{
                    orient: 'left',
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: renderChartLabel(),
                    legendOffset: -40,
                    legendPosition: 'middle'
                }}
                colors={d => d.color}
                pointSize={2}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={8}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabel="y"
                pointLabelYOffset={-10} 
                useMesh={true}
                legends={[
                    {
                        anchor: 'bottom',
                        direction: 'row',
                        justify: false,
                        translateX: 100,
                        translateY: 80,
                        itemsSpacing: 60,
                        itemDirection: 'left-to-right',
                        itemWidth: 80,
                        itemHeight: 20,
                        itemOpacity: 0.75,
                        symbolSize: 12,
                        symbolShape: 'circle',
                        symbolBorderColor: 'rgba(0, 0, 0, .5)',
                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemBackground: 'rgba(0, 0, 0, .03)',
                                    itemOpacity: 1
                                }
                            }
                        ]
                    }
                ]}
            />
        </GraphContainer>
    );
}