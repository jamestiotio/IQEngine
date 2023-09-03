// Copyright (c) 2022 Microsoft Corporation
// Copyright (c) 2023 Marc Lichtman
// Licensed under the MIT License

import Plot from 'react-plotly.js';
import React, { useEffect, useState } from 'react';
import { fftshift } from 'fftshift';
import { template } from '@/utils/plotlyTemplate';
import { FFT } from '@/utils/fft';
import { useSpectrogramContext } from '../hooks/use-spectrogram-context';

interface FreqPlotProps {
  displayedIQ: Float32Array;
}

export const FrequencyPlot = ({ displayedIQ }: FreqPlotProps) => {
  const { spectrogramWidth, spectrogramHeight } = useSpectrogramContext();
  const [magnitudes, setMagnitudes] = useState();

  useEffect(() => {
    if (displayedIQ && displayedIQ.length > 0) {
      // Calc PSD
      const fftSize = Math.pow(2, Math.floor(Math.log2(displayedIQ.length / 2)));
      const f = new FFT(fftSize);
      let out = f.createComplexArray(); // creates an empty array the length of fft.size*2
      f.transform(out, displayedIQ.slice(0, fftSize * 2)); // assumes input (2nd arg) is in form IQIQIQIQ and twice the length of fft.size
      out = out.map((x) => x / fftSize);
      let mags = new Array(out.length / 2);
      for (let j = 0; j < out.length / 2; j++) {
        mags[j] = Math.sqrt(Math.pow(out[j * 2], 2) + Math.pow(out[j * 2 + 1], 2)); // take magnitude
      }
      fftshift(mags); // in-place
      mags = mags.map((x) => 10.0 * Math.log10(x));
      setMagnitudes(mags);
    }
  }, [displayedIQ]); // TODO make sure this isnt going to be sluggish when currentSamples is huge

  return (
    <div className="px-3">
      <p className="text-primary text-center">Below shows the power spectral density of the sample range displayed on the spectrogram tab</p>
      <Plot
        data={[
          {
            y: magnitudes,
            type: 'scatter',
          },
        ]}
        layout={{
          width: spectrogramWidth,
          height: spectrogramHeight,
          margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0,
            pad: 0
          },
          dragmode: 'pan',
          template: template,
          xaxis: {
            title: 'Frequency',
            //range: [0, 100],
            rangeslider: { range: [0, 100] },
          },
          yaxis: {
            title: 'Magnitude',
            fixedrange: false,
          },
        }}
        config={{
          displayModeBar: true,
          scrollZoom: true,
        }}
      />
    </div>
  );
};
