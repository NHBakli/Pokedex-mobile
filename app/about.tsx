import {Text, View} from "react-native";

export default function about(){
    return(
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Text>About.</Text>
        </View>
    )
}