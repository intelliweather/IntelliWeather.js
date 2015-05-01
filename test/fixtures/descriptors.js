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
  },
  customBrandingPopupSeries: {
    channel: 5,
    commands: {
      watermarks: [
        '1_KPAY'
      ],
      mode: "max",
      quality: 85
    },
    displayWidth: 320,
    displayHeight: 240,
    series: false,
    expand: {
      channel: 5,
      displayWidth: 640,
      displayHeight: 480,
      series: true,
      seriesLength: 12,
      commands: {
        watermarks: [
          '1_KPAY'
        ],
        mode: 'max',
        quality: 85
      }
    }
  }
};
