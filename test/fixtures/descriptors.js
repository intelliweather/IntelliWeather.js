var fixtures = fixtures || {};

fixtures.descriptors = {
  popupSeries: {
    channel: 2,
    commands: {
      crop: [
        129,
        405,
        769,
        885
      ],
      watermarks: [
        '1_IntelliWeather'
      ],
      mode: 'max',
      quality: 85
    },
    displayWidth: 160,
    displayHeight: 120,
    series: false,
    expand: {
      channel: 2,
      displayWidth: 640,
      displayHeight: 480,
      series: true,
      seriesLength: 12,
      timeZone: 'utc',
      commands: {
        crop: [
          129,
          405,
          769,
          885
        ],
        watermarks: [
          '1_IntelliWeather'
        ],
        mode: 'max',
        quality: 85
      }
    },
    onclick: 'popup'
  },
  series: {
    channel: 5,
    commands: {
      watermarks: [
        '1_IntelliWeather'
      ],
      mode: 'max',
      quality: 85
    },
    displayWidth: 640,
    displayHeight: 480,
    series: true,
    seriesLength: 12,
    timeZone: 'utc'
  }
};
