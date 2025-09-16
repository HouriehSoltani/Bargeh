import React from 'react';
import { DatePicker } from "@react-shamsi/datepicker";
import { Box, Text } from '@chakra-ui/react';
import { useColorModeValue } from '@/hooks/useColorMode';

// Import the required styles
import "@react-shamsi/calendar/dist/styles.css";
import "@react-shamsi/datepicker/dist/styles.css";
import "@react-shamsi/timepicker/dist/styles.css";

interface PersianDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
  label?: string;
}

const PersianDatePicker: React.FC<PersianDatePickerProps> = ({
  value,
  onChange,
  errorMessage,
  label
}) => {
  const textColor = useColorModeValue('gray.800', 'white');
  const errorColor = useColorModeValue('red.500', 'red.400');

  // Convert ISO string to Date for react-shamsi
  const getJalaliDate = (isoString: string) => {
    if (!isoString) return undefined;
    return new Date(isoString);
  };

  // Convert Date to ISO string
  const dateToISO = (date: Date) => {
    if (!date) return '';
    return date.toISOString();
  };

  const handleDateChange = (date: Date) => {
    const isoString = dateToISO(date);
    onChange(isoString);
  };


  return (
    <Box>
      {label && (
        <Text fontSize="sm" fontWeight="medium" color={textColor} mb={2}>
          {label}
        </Text>
      )}
      <Box>
        <DatePicker
          date={getJalaliDate(value)}
          onChange={handleDateChange}
          placeholder="تاریخ و زمان را انتخاب کنید"
          dateFormat="yyyy/MM/dd HH:mm"
          persianDigits={true}
          autoUpdate={true}
          calendarProps={{
            theme: 'light',
            highlightToday: true,
            showGoToToday: true,
            showFooter: true,
            showFridaysAsRed: true
          }}
        />
      </Box>
      {errorMessage && (
        <Text color={errorColor} fontSize="sm" mt={1}>
          {errorMessage}
        </Text>
      )}
    </Box>
  );
};

export default PersianDatePicker;