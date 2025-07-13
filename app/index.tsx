import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/auth.styles";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is what I wanted</Text>
      <TouchableOpacity onPress={() => alert("Button pressed!")}>
        <Text>Click me</Text>
      </TouchableOpacity>
    </View>
  );
}
