import { Link } from "expo-router";
import { View } from "react-native";
import { styles } from "../styles/auth.styles";

export default function Index() {
  return (
    <View style={styles.container}>
      <Link href="/profile">Go to Profile</Link>
      <Link href="/notifications">Go to Notifications</Link>
    </View>
  );
}
