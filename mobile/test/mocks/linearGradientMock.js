const React = require('react');
const { View } = require('react-native');

module.exports = {
  LinearGradient: ({ children, ...props }) => React.createElement(View, props, children),
};
