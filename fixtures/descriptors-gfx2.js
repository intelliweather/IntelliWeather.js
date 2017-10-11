var fixtures = fixtures || {};

fixtures.descriptors = {
  popupSeries: {
    imageHost: 'https://gfx2.intelliweather.net',
    channel: 2,
    description: '',
    commands: {
      crop: [
        129,
        405,
        769,
        885
      ],
      layers: [
        '1_IntelliWeather',
        '1_Radar'
      ],
      mode: 'max',
      quality: 85
    },
    displayWidth: 180,
    displayHeight: 140,
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
        layers: [
          '1_IntelliWeather',
          '1_Radar'
        ],
        mode: 'max',
        quality: 85
      }
    },
    onclick: 'popup'
  },
  series: {
    imageHost: 'https://gfx2.intelliweather.net',
    channel: 5,
    commands: {
      layers: [
        '1_IntelliWeather',
        '1_Radar'
      ],
      mode: 'max',
      quality: 85
    },
    displayWidth: 640,
    displayHeight: 480,
    series: true,
    seriesLength: 12
  },
  customBrandingPopupSeries: {
    imageHost: 'https://gfx2.intelliweather.net',
    channel: 5,
    commands: {
      layers: [
        '1_KPAY',
        '1_Radar'
      ],
      mode: "max",
      quality: 85
    },
    displayWidth: 320,
    displayHeight: 240,
    timeStampOptions: {
      timezone: 'utc',
      timeFormat: 'twenty-four-hour'
    },
    series: false,
    expand: {
      channel: 5,
      displayWidth: 640,
      displayHeight: 480,
      timeStampOptions: {
        timezone: 'utc',
        timeFormat: 'twenty-four-hour'
      },
      series: true,
      seriesLength: 12,
      commands: {
        layers: [
          '1_KPAY',
          '1_Radar'
        ],
        mode: 'max',
        quality: 85
      }
    }
  },
  popupStill: {
    imageHost: 'https://gfx2.intelliweather.net',
    channel: 55,
    description: '',
    commands: {
      crop: [
        2283,
        1499,
        3562,
        2218
      ],
      layers: [
        '1_IntelliWeather',
        '1_Radar'
      ],
      mode: 'max',
      quality: 85
    },
    displayWidth: 180,
    displayHeight: 140,
    series: false,
    expand: {
      channel: 55,
      displayWidth: 1280,
      displayHeight: 720,
      series: false,
      commands: {
        crop: [
          2283,
          1499,
          3562,
          2218
        ],
        layers: [
          '1_IntelliWeather',
          '1_Radar'
        ],
        mode: 'max',
        quality: 85
      }
    },
    onclick: 'popup'
  }
};
