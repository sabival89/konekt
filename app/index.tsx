import { Redirect } from 'expo-router'
import React from 'react'
import { StyleSheet } from 'react-native'

const Index = () => {
  return <Redirect href="/(auth)/login" />
}

export default Index

const styles = StyleSheet.create({})
