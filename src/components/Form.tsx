import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { DataTable, TextInput, Button, Text } from 'react-native-paper';
// @ts-ignore
import Icon from 'react-native-vector-icons/FontAwesome';

interface Row {
  run: number;
  date: Date;
  earned: number | null;
  repairCost: number | null;
  profit: number | null;
}

const initialRow: Row = {
  run: 0,
  date: new Date(),
  earned: null,
  repairCost: null,
  profit: null,
};

const calculateProfit = (row: Row): Row['profit'] =>
  row.earned && row.repairCost ? row.earned - row.repairCost : null;

const getIdOfLastRun = (rows: Row[]): number =>
  rows.length ? rows[rows.length - 1].run : -1;

const storeData = async (value: object) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem('stepn_rows', jsonValue);
  } catch (e) {}
};

const getData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('stepn_rows');
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {}
};

const Form = () => {
  const [rows, setRows] = useState<Row[]>([initialRow]);

  useEffect(() => {
    const loadData = async () => {
      const data = await getData();
      if (data) {
        const newRows = data.map((row: Row) => ({
          ...row,
          date: new Date(row.date),
        }));
        setRows(newRows);
      }
    };
    loadData();
  }, []);

  const handleChangeEarned = (value: string, index: number) => {
    const updatedRows: Row[] = rows.map(row => {
      const newRow = { ...row, earned: +value };
      return row.run === index
        ? { ...newRow, profit: calculateProfit(newRow) }
        : row;
    });
    setRows(updatedRows);
    storeData(updatedRows);
  };

  const handleChangeRepairCost = (value: string, index: number) => {
    const updatedRows: Row[] = rows.map(row => {
      const newRow = { ...row, repairCost: +value };
      return row.run === index
        ? { ...newRow, profit: calculateProfit(newRow) }
        : row;
    });
    setRows(updatedRows);
    storeData(updatedRows);
  };

  const handleDateChange = (value: Date, index: number) => {
    const onChange = (event: any, selectedDate: any) => {
      const updatedRows: Row[] = rows.map(row => {
        const newRow = { ...row, date: selectedDate };
        return row.run === index
          ? { ...newRow, profit: calculateProfit(newRow) }
          : row;
      });
      setRows(updatedRows);
      storeData(updatedRows);
    };

    DateTimePickerAndroid.open({
      value,
      onChange,
    });
  };

  const addNewRow = () => {
    const newRow = {
      ...initialRow,
      run: getIdOfLastRun(rows) + 1,
    };
    setRows([...rows, newRow]);
  };

  const removeRow = (index: number) => {
    const newRows = rows.filter(row => row.run !== index);
    setRows(newRows);
    storeData(newRows);
  };

  const calculateTotalProfit = () =>
    rows.reduce((total, { profit }) => (profit ? total + profit : total), 0);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Stepn Diary</Text>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>#Run</DataTable.Title>
          <DataTable.Title>Date</DataTable.Title>
          <DataTable.Title>Earned</DataTable.Title>
          <DataTable.Title>Repair Cost</DataTable.Title>
          <DataTable.Title>Profit</DataTable.Title>
        </DataTable.Header>

        {rows.map((row, index) => (
          <DataTable.Row key={index}>
            <DataTable.Cell>
              <Icon
                onPress={() => removeRow(index)}
                name="remove"
                size={18}
                color="#900"
              />
              {row.run + 1}
            </DataTable.Cell>
            <DataTable.Cell>
              <Text onPress={() => handleDateChange(row.date, index)}>{row.date.toLocaleDateString('en-US')}</Text>
            </DataTable.Cell>
            <DataTable.Cell>
              <TextInput
                onChangeText={text => handleChangeEarned(text, index)}
                value={row.earned ? row.earned.toString() : ''}
              />
            </DataTable.Cell>
            <DataTable.Cell>
              <TextInput
                onChangeText={text => handleChangeRepairCost(text, index)}
                value={row.repairCost ? row.repairCost.toString() : ''}
              />
            </DataTable.Cell>
            <DataTable.Cell>{row.profit}</DataTable.Cell>
          </DataTable.Row>
        ))}

        <Text style={styles.totalProfit}>
          Total Profit - {calculateTotalProfit()} GST
        </Text>

        <Button mode="contained" onPress={addNewRow} style={styles.button}>
          New Row
        </Button>
        <Button onPress={() => setRows([initialRow])} style={styles.button}>
          Reset
        </Button>
      </DataTable>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    textAlign: 'center',
    fontSize: 25,
  },
  container: {
    paddingTop: 20,
  },
  datePicker: {
    width: 100,
    backgroundColor: 'black',
  },
  button: {
    marginTop: 20,
    height: 40,
  },
  totalProfit: {
    paddingLeft: 5,
    marginTop: 20,
    fontSize: 16,
  },
});

export default Form;
