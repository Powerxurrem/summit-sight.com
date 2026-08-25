import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const modes = [
  {
    name: "Classic Mazes",
    type: "24 LEVELS / PROGRESSIVE",
    copy: "Keys, blink pads, lightning gates and patrols packed into increasingly rude little labyrinths.",
    route: "/mazeloop",
    color: "#58766b",
    mark: "classic",
  },
  {
    name: "Echo Rooms",
    type: "15 ROOMS / RECORD & REPLAY",
    copy: "Record your movement, release an echo and cooperate with the version of you that just happened.",
    route: "/echo-rooms",
    color: "#536f7a",
    mark: "echo",
  },
  {
    name: "Relay Vaults",
    type: "EXPEDITION / LARGE MAZES",
    copy: "Carry three cores through a waking machine while gates, blink pads and patrols come online.",
    route: "/relay-vaults",
    color: "#695875",
    mark: "relay",
  },
] as const;

function ModeArt({ kind }: { kind: typeof modes[number]["mark"] }) {
  if (kind === "echo") return <View style={styles.artScene}><View style={[styles.orb, styles.echoOrb]} /><View style={[styles.orb, styles.echoGhost]} /><View style={styles.echoGate} /></View>;
  if (kind === "relay") return <View style={styles.artScene}><View style={styles.relay}><View style={[styles.core, { backgroundColor: "#df8b5b" }]} /><View style={[styles.core, { backgroundColor: "#67aab2" }]} /><View style={[styles.core, { backgroundColor: "#a47bc0" }]} /></View><View style={styles.relayPath} /></View>;
  return <View style={styles.artScene}><View style={[styles.mazeLine, styles.mazeLineA]} /><View style={[styles.mazeLine, styles.mazeLineB]} /><View style={[styles.mazeLine, styles.mazeLineC]} /><View style={styles.classicOrb} /></View>;
}

export default function MazeHubScreen() {
  const [unlocked, setUnlocked] = useState(1);

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem("mazeloop-unlocked").then((value) => setUnlocked(Number(value ?? 1)));
  }, []));

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.replace("/")}><Text style={styles.back}>{"< ODDLOOP"}</Text></Pressable>
          <Text style={styles.logo}>MAZELOOP</Text>
          <Text style={styles.count}>3 MODES</Text>
        </View>

        <View style={styles.intro}>
          <Text style={styles.kicker}>THE PUZZLE WING</Text>
          <Text style={styles.title}>Choose your way in.</Text>
          <Text style={styles.body}>Three kinds of maze. Each one bends a different part of your brain.</Text>
        </View>

        <View style={styles.modes}>{modes.map((mode, index) => (
          <Pressable key={mode.name} onPress={() => router.push(mode.route)} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
            <View style={[styles.cardArt, { backgroundColor: mode.color }]}><ModeArt kind={mode.mark} /><Text style={styles.number}>0{index + 1}</Text></View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardType}>{mode.type}</Text>
              <Text style={styles.cardTitle}>{mode.name}</Text>
              <Text style={styles.cardBody}>{mode.copy}</Text>
              <View style={styles.cardFooter}><Text style={styles.progress}>{index === 0 ? `${unlocked}/24 UNLOCKED` : index === 1 ? "ECHO LAB" : "12x12 + 14x14"}</Text><Text style={styles.play}>ENTER {">"}</Text></View>
            </View>
          </Pressable>
        ))}</View>

        <View style={styles.footer}><Text style={styles.footerText}>READ THE ROOM. BREAK THE LOOP.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:"#101714"},scroll:{paddingHorizontal:16,paddingBottom:42},header:{height:58,flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderBottomWidth:1,borderBottomColor:"#29362f"},back:{color:"#909a92",fontSize:9,fontWeight:"800",letterSpacing:.7},logo:{color:"#f0eadb",fontSize:10,fontWeight:"900",letterSpacing:1.5},count:{color:"#6f7b72",fontSize:8,fontWeight:"800",letterSpacing:1},intro:{paddingTop:31,paddingBottom:25},kicker:{color:"#d4774c",fontSize:8,fontWeight:"900",letterSpacing:1.2},title:{marginTop:8,color:"#f0eadb",fontFamily:"serif",fontSize:39,lineHeight:42,letterSpacing:-1.4},body:{maxWidth:330,marginTop:11,color:"#8f9a92",fontSize:12,lineHeight:18},modes:{gap:13},card:{minHeight:170,flexDirection:"row",overflow:"hidden",borderWidth:1,borderColor:"#2e3b34",borderRadius:18,backgroundColor:"#17211d"},cardPressed:{transform:[{scale:.985}],borderColor:"#64776c"},cardArt:{width:112,overflow:"hidden"},artScene:{flex:1,alignItems:"center",justifyContent:"center"},number:{position:"absolute",left:10,bottom:9,color:"rgba(240,234,219,.65)",fontFamily:"serif",fontSize:11},mazeLine:{position:"absolute",borderWidth:2,borderColor:"rgba(236,229,207,.56)"},mazeLineA:{width:75,height:105,left:17,top:24},mazeLineB:{width:43,height:73,left:17,top:56,borderRightWidth:0},mazeLineC:{width:28,height:40,right:20,top:24,borderBottomWidth:0},classicOrb:{width:14,height:14,borderRadius:8,backgroundColor:"#e7c477",shadowColor:"#e7c477",shadowOpacity:1,shadowRadius:8},orb:{position:"absolute",width:19,height:19,borderRadius:10},echoOrb:{left:26,top:51,backgroundColor:"#e6bd6d"},echoGhost:{right:25,bottom:47,borderWidth:2,borderColor:"#8dd4d5",backgroundColor:"rgba(97,174,179,.35)"},echoGate:{width:58,height:58,borderWidth:2,borderColor:"rgba(225,237,229,.45)",transform:[{rotate:"45deg"}]},relay:{width:61,height:61,flexDirection:"row",alignItems:"center",justifyContent:"space-around",paddingHorizontal:7,borderWidth:2,borderColor:"rgba(239,232,215,.55)",borderRadius:9,backgroundColor:"rgba(20,29,25,.35)"},core:{width:11,height:11,borderRadius:6},relayPath:{position:"absolute",width:2,height:45,bottom:0,backgroundColor:"rgba(239,232,215,.4)"},cardCopy:{flex:1,padding:17},cardType:{color:"#d4774c",fontSize:7,fontWeight:"900",letterSpacing:.75},cardTitle:{marginTop:5,color:"#f0eadb",fontFamily:"serif",fontSize:25},cardBody:{marginTop:7,color:"#929b92",fontSize:10,lineHeight:15},cardFooter:{marginTop:"auto",paddingTop:10,flexDirection:"row",justifyContent:"space-between"},progress:{color:"#78857c",fontSize:7,fontWeight:"800",letterSpacing:.5},play:{color:"#d3d9d1",fontSize:8,fontWeight:"900",letterSpacing:.7},footer:{marginTop:32,paddingTop:20,borderTopWidth:1,borderTopColor:"#29362f",alignItems:"center"},footerText:{color:"#5f6c64",fontSize:7,fontWeight:"800",letterSpacing:1.2},
});
