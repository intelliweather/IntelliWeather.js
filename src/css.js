/*
 * IntelliWeather.js
 * Copyright 2014 IntelliWeather, Inc.
 */

var css = (function() {
  'use strict';

  return {
    iwTopBar: {
      fontFamily: '"Tahoma", "Century Gothic", "Helvetica Neue", Helvetica, Arial',
      fontSize: '12px',
      fontWeight: 'bold',
      width: '100%',
      zIndex: '100',
      position: 'absolute',
      top: '0px',
      padding: '8px',
      paddingBottom: '0px',
      color: 'white',
      textShadow: '-1px 1px 5px #000, 1px -1px 5px #000'
    },
    iwTime: {
      position: 'absolute',
      top: '8px',
      right: '23px'
    },
    iwControls: {
      paddingTop: '8px',
      textAlign: 'center',
      fontSize: '16px',
      textShadow: '2px 2px 6px black'
    },
    iwPrevious: {
      cursor: 'pointer',
      padding: '8px',
      paddingLeft: '20px',
      paddingRight: '50px',
    },
    iwNext: {
      cursor: 'pointer',
      padding: '8px',
      paddingLeft: '50px',
      paddingRight: '20px'
    },
    iwPausePlay: {
      cursor: 'pointer',
      padding: '8px',
      paddingLeft: '50px',
      paddingRight: '50px'
    },
    iwMinus: {
      cursor: 'pointer',
      padding: '8px'
    },
    iwSpeedIndicator: {
      padding: '5px'
    },
    iwPlus: {
      cursor: 'pointer',
      padding: '8px'
    },
    overlay: {
      position: 'fixed',
      zIndex: '500',
      top: '0px',
      left: '0px',
      height: '100%',
      width: '100%',
      background: '#000',
      display: 'none'
    },
    modal: {
      display: 'none',
      position: 'fixed',
      opacity: '0',
      zIndex: '11000',
      left: '50%'
    },
    modalHeader: {
      display: 'block',
      height: '20px',
      padding: '0 5px 0 0',
      color: 'white',
      backgroundColor: '#000000',
      textAlign: 'right'
    },
    modalClose: {
      cursor: 'pointer'
    },
    modalContent: {
      display: 'block',
      position: 'absolute'
    }
  };
})();
