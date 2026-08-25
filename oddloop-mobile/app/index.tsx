import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const modules = [
  { name: "Driftline", type: "ARCADE / ENDLESS", copy: "Hold the curve. Find the opening. Lose all sense of up.", ready: true, color: "#52695d", route: "/driftline" },
  { name: "Mazeloop", type: "PUZZLE / THREE MODES", copy: "Classic mazes, recorded echoes and large relay vaults. Pick your way in.", ready: true, color: "#58766b", route: "/maze-hub" },
  { name: "Peak Stack", type: "TIMING / ENDLESS", copy: "Perfect landings and one more increasingly questionable block.", ready: false, color: "#a26d50", route: "/driftline" },
  { name: "Tiny Delve", type: "PUZZLE / ROGUELIKE", copy: "Seven by seven. One move at a time. Coming to the cabinet.", ready: false, color: "#716b50", route: "/driftline" },
  { name: "Emberbound", type: "RPG / TURN BASED", copy: "Three travellers and one very inconvenient wyrm.", ready: false, color: "#735261", route: "/driftline" },
] as const;

export default function HomeScreen() {
  const [best, setBest] = useState(0);
  const [mazeUnlocked, setMazeUnlocked] = useState(1);

  useFocusEffect(useCallback(() => {
    Promise.all([AsyncStorage.getItem("driftline-best"), AsyncStorage.getItem("mazeloop-unlocked")]).then(([driftBest, mazeLevel]) => {
      setBest(Number(driftBest ?? 0));
      setMazeUnlocked(Number(mazeLevel ?? 1));
    });
  }, []));

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brand}><View style={styles.logo}><Text style={styles.logoText}>o</Text></View><Text style={styles.brandText}>oddloop</Text></View>
          <Text style={styles.version}>CABINET 01</Text>
        </View>

        <Pressable style={styles.feature} onPress={() => router.push("/driftline")}>
          <View style={styles.featureArt}>
            <View style={[styles.previewRing, styles.previewRingOne]} /><View style={[styles.previewRing, styles.previewRingTwo]} /><View style={[styles.previewRing, styles.previewRingThree]} />
            <View style={styles.previewBall} /><Text style={styles.best}>BEST RUN {best}</Text>
          </View>
          <View style={styles.featureCopy}><Text style={styles.kicker}>TODAY&apos;S LOOP</Text><Text style={styles.title}>Lose yourself{"\n"}in the line.</Text><Text style={styles.body}>Driftline is simple until your sense of direction quietly leaves the room.</Text><View style={styles.play}><Text style={styles.playText}>PLAY DRIFTLINE</Text><Text style={styles.playArrow}>{">"}</Text></View></View>
        </Pressable>

        <View style={styles.sectionHeader}><View><Text style={styles.kicker}>THE CABINET</Text><Text style={styles.heading}>Pick a loop.</Text></View><Text style={styles.count}>2 OF 5 READY</Text></View>
        <View style={styles.grid}>{modules.map((game) => (
          <Pressable key={game.name} disabled={!game.ready} onPress={() => router.push(game.route)} style={({ pressed }) => [styles.card, pressed && game.ready && styles.cardPressed, !game.ready && styles.cardLocked]}>
            <View style={[styles.cardArt, { backgroundColor: game.color }]}><Text style={styles.cardLetter}>{game.name[0]}</Text>{!game.ready && <Text style={styles.soon}>SOON</Text>}</View>
            <View style={styles.cardCopy}><Text style={styles.cardType}>{game.type}</Text><Text style={styles.cardTitle}>{game.name}</Text><Text style={styles.cardBody}>{game.copy}</Text><Text style={styles.cardFooter}>{game.ready ? (game.name === "Mazeloop" ? `LEVEL ${mazeUnlocked} / PLAY` : `BEST ${best} / PLAY`) : "MODULE RESERVED"}</Text></View>
          </Pressable>
        ))}</View>

        <View style={styles.footer}><Text style={styles.footerTag}>Tiny games. Strange loops.</Text><Text style={styles.footerSmall}>Made at Summit Sight</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:"#101714"},scroll:{paddingHorizontal:16,paddingBottom:40},header:{height:64,flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderBottomWidth:1,borderBottomColor:"#29362f"},brand:{flexDirection:"row",alignItems:"center",gap:8},logo:{width:29,height:29,borderWidth:3,borderColor:"#d4774c",borderRadius:15,alignItems:"center",justifyContent:"center"},logoText:{color:"#f0eadb",fontFamily:"serif",fontSize:18},brandText:{color:"#f0eadb",fontFamily:"serif",fontSize:19,fontWeight:"600"},version:{color:"#6f7b72",fontSize:9,letterSpacing:1.2,fontWeight:"700"},feature:{marginTop:16,borderWidth:1,borderColor:"#2c3832",borderRadius:22,overflow:"hidden",backgroundColor:"#151e1a"},featureArt:{height:300,overflow:"hidden",alignItems:"center",justifyContent:"center",backgroundColor:"#0e1713"},previewRing:{position:"absolute",borderRadius:999,borderWidth:10,borderColor:"#53675b"},previewRingOne:{width:250,height:250,borderColor:"#a75b40",transform:[{rotate:"18deg"}]},previewRingTwo:{width:155,height:155,borderColor:"#c18a59",borderWidth:7},previewRingThree:{width:70,height:70,borderColor:"#61786a",borderWidth:4},previewBall:{position:"absolute",left:"23%",bottom:"20%",width:22,height:22,borderRadius:11,backgroundColor:"#efc777",shadowColor:"#eaa258",shadowOpacity:1,shadowRadius:12},best:{position:"absolute",right:14,bottom:13,paddingHorizontal:11,paddingVertical:7,borderRadius:15,overflow:"hidden",backgroundColor:"rgba(16,23,20,.82)",color:"#aab2aa",fontSize:9,letterSpacing:1},featureCopy:{padding:25},kicker:{color:"#d4774c",fontSize:9,fontWeight:"800",letterSpacing:1.4},title:{marginTop:12,color:"#f0eadb",fontFamily:"serif",fontSize:48,lineHeight:45,letterSpacing:-2},body:{marginTop:17,color:"#929b92",fontSize:14,lineHeight:21},play:{marginTop:24,alignSelf:"flex-start",flexDirection:"row",alignItems:"center",gap:22,paddingHorizontal:15,paddingVertical:11,borderRadius:22,backgroundColor:"#f0eadb"},playText:{color:"#13201a",fontSize:10,fontWeight:"900",letterSpacing:.8},playArrow:{color:"#13201a",fontSize:17},sectionHeader:{marginTop:62,marginBottom:18,flexDirection:"row",alignItems:"flex-end",justifyContent:"space-between"},heading:{marginTop:6,color:"#f0eadb",fontFamily:"serif",fontSize:37,letterSpacing:-1.5},count:{color:"#6f7b72",fontSize:8,letterSpacing:1},grid:{gap:12},card:{minHeight:150,flexDirection:"row",overflow:"hidden",borderWidth:1,borderColor:"#2c3832",borderRadius:16,backgroundColor:"#17211d"},cardPressed:{transform:[{scale:.985}],borderColor:"#52645a"},cardLocked:{opacity:.62},cardArt:{width:112,alignItems:"center",justifyContent:"center"},cardLetter:{color:"#f0eadb",fontFamily:"serif",fontSize:51},soon:{position:"absolute",bottom:10,color:"rgba(255,255,255,.65)",fontSize:8,fontWeight:"800",letterSpacing:1.2},cardCopy:{flex:1,padding:17},cardType:{color:"#d4774c",fontSize:8,fontWeight:"800",letterSpacing:.8},cardTitle:{marginTop:5,color:"#f0eadb",fontFamily:"serif",fontSize:25},cardBody:{marginTop:6,color:"#929b92",fontSize:11,lineHeight:16},cardFooter:{marginTop:"auto",paddingTop:10,color:"#c0c7bf",fontSize:8,fontWeight:"700",letterSpacing:.6},footer:{marginTop:62,paddingTop:25,borderTopWidth:1,borderTopColor:"#2c3832",flexDirection:"row",justifyContent:"space-between"},footerTag:{color:"#929b92",fontSize:10},footerSmall:{color:"#5e6961",fontSize:9},
});
