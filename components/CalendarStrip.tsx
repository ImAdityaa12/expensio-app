import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface CalendarStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const CalendarStrip = ({ selectedDate, onDateSelect }: CalendarStripProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const scrollViewRef = useRef<ScrollView>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const numDays = new Date(year, month + 1, 0).getDate();
    
    for (let i = 1; i <= numDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInMonth(currentMonth);

  const scrollToIndex = (index: number) => {
    if (scrollViewRef.current) {
        // approximate item width + margin = 60 + 8 = 68
        const x = index * 68 - width / 2 + 34; 
        scrollViewRef.current.scrollTo({ x, animated: true });
    }
  };

  useEffect(() => {
    // Scroll to selected date if it's in the current month
    const index = days.findIndex(d => 
      d.getDate() === selectedDate.getDate() && 
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    );
    if (index !== -1) {
        // Delay slightly to ensure layout is ready
        setTimeout(() => scrollToIndex(index), 100);
    } else {
        // If selected date is not in current view, maybe update current view?
        // But for now, let's just let the user navigate.
    }
  }, [selectedDate, currentMonth]);

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center px-5 mb-4">
        <TouchableOpacity onPress={handlePrevMonth} className="p-2 bg-white rounded-full shadow-sm border border-gray-100">
          <Ionicons name="chevron-back" size={20} color="#1E1E1E" />
        </TouchableOpacity>
        
        <Text className="text-text-dark font-bold text-[16px]">
          {formatMonthYear(currentMonth)}
        </Text>
        
        <TouchableOpacity onPress={handleNextMonth} className="p-2 bg-white rounded-full shadow-sm border border-gray-100">
          <Ionicons name="chevron-forward" size={20} color="#1E1E1E" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        ref={scrollViewRef}
      >
        {days.map((day, index) => {
          const isSelected = isSameDay(day, selectedDate);
          return (
            <TouchableOpacity
              key={day.toISOString()}
              onPress={() => {
                onDateSelect(day);
                if (day.getMonth() !== currentMonth.getMonth()) {
                    setCurrentMonth(new Date(day));
                }
              }}
              className={`mr-2 items-center justify-center w-[60px] h-[70px] rounded-[20px] border ${
                isSelected 
                  ? 'bg-primary border-primary' 
                  : 'bg-white border-gray-100'
              }`}
              style={{
                shadowColor: isSelected ? '#5B2EFF' : '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isSelected ? 0.3 : 0.05,
                shadowRadius: 8,
                elevation: isSelected ? 8 : 2
              }}
            >
              <Text className={`text-[12px] font-medium mb-1 ${isSelected ? 'text-white/80' : 'text-text-grey'}`}>
                {formatDayName(day)}
              </Text>
              <Text className={`text-[18px] font-bold ${isSelected ? 'text-white' : 'text-text-dark'}`}>
                {day.getDate()}
              </Text>
              {isSelected && (
                <View className="absolute bottom-1.5 w-1 h-1 rounded-full bg-white" />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
