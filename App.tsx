import React from 'react';
import {
  ScrollView,
} from 'react-native';

import Form from './src/components/Form';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const App = () => {
  const isDarkMode = false;

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    minHeight: '100%',
  };

  return (
    <ScrollView style={backgroundStyle}>
      <Form />
    </ScrollView>
  );
};

export default App;
