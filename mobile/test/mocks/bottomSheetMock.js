const React = require('react');

const Mock = ({ children }) => React.createElement(React.Fragment, null, children);

module.exports = {
  __esModule: true,
  default: Mock,
  BottomSheetView: Mock,
  BottomSheetScrollView: Mock,
  BottomSheetTextInput: Mock,
  BottomSheetModal: Mock,
  BottomSheetModalProvider: Mock,
  useBottomSheetModal: () => ({
    present: jest.fn(),
    dismiss: jest.fn(),
    dismissAll: jest.fn(),
  }),
};
