var fixtures = fixtures || {};

fixtures.descriptors = {
  popupSeries: {
    channel: 2,
    commands: {
      crop: [
        129,
        405,
        768,
        884
      ],
      layers: [
        '1_IntelliWeather'
      ],
      mode: 'max',
      quality: 85
    },
    displayWidth: 160,
    displayHeight: 120,
    series: false,
    inner: {
      displayWidth: 640,
      displayHeight: 480,
      series: true,
      seriesLength: 12
    },
    onclick: 'popup'
  },
  series: {
    channel: 5,
    commands: {
      layers: [
        '1_IntelliWeather'
      ],
      mode: 'max',
      quality: 85
    },
    displayWidth: 640,
    displayHeight: 480,
    series: true,
    seriesLength: 12
  }
};
