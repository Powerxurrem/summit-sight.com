import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { PanResponder, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type Point = { x: number; y: number };
type Vault = { size: number; walls: Set<string>; relay: Point; cores: Point[]; doors: Point[]; pads: [Point, Point]; exit: Point; patrol: Point[] };

const COLORS = ["#df8b5b", "#67aab2", "#a47bc0"];
const pointKey = (point: Point) => `${point.x},${point.y}`;
const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

const makeVault = (size: number): Vault => {
  const walls = new Set<string>();
  const middle = Math.floor(size / 2);
  for (let index = 0; index < size; index += 1) {
    walls.add(`${index},0`); walls.add(`${index},${size - 1}`); walls.add(`0,${index}`); walls.add(`${size - 1},${index}`);
  }
  for (let y = 1; y < size - 1; y += 1) walls.add(`${middle},${y}`);
  for (let x = 1; x < size - 1; x += 1) walls.add(`${x},${middle}`);
  const doors = [{ x: middle, y: 3 }, { x: 3, y: middle }, { x: middle, y: size - 4 }];
  doors.forEach((door) => walls.delete(pointKey(door)));
  const patrol: Point[] = [];
  for (let x = 1; x < middle; x += 1) patrol.push({ x, y: 2 });
  for (let y = 3; y < middle; y += 1) patrol.push({ x: middle - 1, y });
  for (let x = middle - 2; x >= 1; x -= 1) patrol.push({ x, y: middle - 1 });
  for (let y = middle - 2; y >= 3; y -= 1) patrol.push({ x: 1, y });
  return {
    size,
    walls,
    relay: { x: 1, y: 1 },
    cores: [{ x: middle - 2, y: 3 }, { x: size - 3, y: 3 }, { x: 3, y: size - 3 }],
    doors,
    pads: [{ x: middle - 2, y: middle - 2 }, { x: middle - 2, y: size - 3 }],
    exit: { x: size - 2, y: size - 2 },
    patrol,
  };
};

export default function RelayVaultsScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [vaultIndex, setVaultIndex] = useState(0);
  const vault = useMemo(() => makeVault(vaultIndex === 0 ? 12 : 14), [vaultIndex]);
  const [player, setPlayer] = useState(vault.relay);
  const [carried, setCarried] = useState<number | null>(null);
  const [installed, setInstalled] = useState([false, false, false]);
  const [moves, setMoves] = useState(0);
  const [escapeMoves, setEscapeMoves] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);
  const [patrolStep, setPatrolStep] = useState(0);
  const [patrolTurn, setPatrolTurn] = useState(false);
  const dragAnchor = useRef({ x: 0, y: 0 });
  const lastDragMove = useRef(0);
  const boardSize = Math.min(width - 24, height - insets.top - insets.bottom - 235, 455);
  const tile = boardSize / vault.size;
  const installedCount = installed.filter(Boolean).length;
  const padActive = installedCount >= 2;
  const patrolActive = installedCount >= 2;
  const patrolPosition = vault.patrol[patrolStep % vault.patrol.length];
  const patrolNext = vault.patrol[(patrolStep + 1) % vault.patrol.length];

  const reset = useCallback((nextVault = vaultIndex) => {
    const next = makeVault(nextVault === 0 ? 12 : 14);
    setVaultIndex(nextVault);
    setPlayer(next.relay);
    setCarried(null);
    setInstalled([false, false, false]);
    setMoves(0);
    setEscapeMoves(null);
    setComplete(false);
    setPatrolStep(0);
    setPatrolTurn(false);
  }, [vaultIndex]);

  const move = useCallback((dx: number, dy: number) => {
    if (complete) return;
    const stepped = { x: player.x + dx, y: player.y + dy };
    const doorIndex = vault.doors.findIndex((door) => same(door, stepped));
    const blocked = vault.walls.has(pointKey(stepped)) || (doorIndex >= 0 && !installed[doorIndex]);
    let nextPatrolStep = patrolStep;
    let nextPatrolTurn = patrolTurn;
    if (patrolActive) {
      nextPatrolTurn = !patrolTurn;
      if (patrolTurn) nextPatrolStep = (patrolStep + 1) % vault.patrol.length;
      const danger = vault.patrol[nextPatrolStep];
      const destination = blocked ? player : stepped;
      if (same(danger, destination)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        reset(vaultIndex);
        return;
      }
      setPatrolStep(nextPatrolStep);
      setPatrolTurn(nextPatrolTurn);
    }
    if (blocked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      return;
    }

    let next = stepped;
    if (padActive && same(stepped, vault.pads[0])) next = vault.pads[1];
    else if (padActive && same(stepped, vault.pads[1])) next = vault.pads[0];
    let nextCarried = carried;
    let nextInstalled = installed;
    const coreIndex = vault.cores.findIndex((core, index) => same(core, next) && !installed[index] && carried !== index);
    if (coreIndex >= 0 && carried === null) {
      nextCarried = coreIndex;
      setCarried(coreIndex);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (same(next, vault.relay) && nextCarried !== null) {
      nextInstalled = installed.map((value, index) => index === nextCarried ? true : value);
      const count = nextInstalled.filter(Boolean).length;
      setInstalled(nextInstalled);
      setCarried(null);
      nextCarried = null;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (count === 3 && escapeMoves === null) setEscapeMoves(vault.size * 3);
    }
    let nextEscape = escapeMoves;
    if (escapeMoves !== null) {
      nextEscape = escapeMoves - 1;
      setEscapeMoves(nextEscape);
      if (nextEscape <= 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        reset(vaultIndex);
        return;
      }
    }
    setPlayer(next);
    setMoves((value) => value + 1);
    if (same(next, vault.exit) && nextInstalled.every(Boolean)) {
      setComplete(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (nextCarried === carried) {
      Haptics.selectionAsync();
    }
  }, [carried, complete, escapeMoves, installed, padActive, patrolActive, patrolStep, patrolTurn, player, reset, vault, vaultIndex]);

  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !complete,
    onMoveShouldSetPanResponder: () => !complete,
    onPanResponderGrant: () => {
      dragAnchor.current = { x: 0, y: 0 };
      lastDragMove.current = 0;
    },
    onPanResponderMove: (_, gesture) => {
      const threshold = Math.max(34, tile * 0.85);
      const dx = gesture.dx - dragAnchor.current.x;
      const dy = gesture.dy - dragAnchor.current.y;
      const now = Date.now();
      if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold || now - lastDragMove.current < 115) return;
      if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : -1, 0);
      else move(0, dy > 0 ? 1 : -1);
      dragAnchor.current = { x: gesture.dx, y: gesture.dy };
      lastDragMove.current = now;
    },
  }), [complete, move, tile]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}><Pressable onPress={() => router.replace("/maze-hub")}><Text style={styles.back}>{"< PUZZLE WING"}</Text></Pressable><Text style={styles.logo}>RELAY VAULTS</Text><Text style={styles.room}>{vault.size}×{vault.size}</Text></View>
      <View style={styles.content}>
        <View style={styles.titleRow}><View><Text style={styles.kicker}>PUZZLE LAB / EXPEDITION</Text><Text style={styles.title}>Wake the machine.</Text><Text style={styles.copy}>Carry one core at a time. Return each to the relay.</Text></View><View style={styles.metric}><Text style={styles.metricLabel}>{escapeMoves === null ? "MOVES" : "ESCAPE"}</Text><Text style={[styles.metricValue, escapeMoves !== null && styles.escape]}>{escapeMoves ?? moves}</Text><Text style={styles.metricSmall}>{installedCount}/3 CORES</Text></View></View>
        <View style={[styles.board, { width: boardSize, height: boardSize }]} {...responder.panHandlers}>
          {Array.from({ length: vault.size * vault.size }, (_, index) => {
            const x = index % vault.size;
            const y = Math.floor(index / vault.size);
            const point = { x, y };
            const wall = vault.walls.has(pointKey(point));
            const doorIndex = vault.doors.findIndex((door) => same(door, point));
            const coreIndex = vault.cores.findIndex((core) => same(core, point));
            return <View key={index} style={[styles.cell, { left: x * tile, top: y * tile, width: tile, height: tile }, wall && styles.wall]}>
              {doorIndex >= 0 && <View style={[styles.door, { backgroundColor: COLORS[doorIndex] }, installed[doorIndex] && styles.doorOpen]} />}
              {same(point, vault.relay) && <View style={styles.relay}>{COLORS.map((color, core) => <View key={color} style={[styles.socket, { borderColor: color }, installed[core] && { backgroundColor: color }]} />)}</View>}
              {coreIndex >= 0 && !installed[coreIndex] && carried !== coreIndex && <View style={[styles.core, { backgroundColor: COLORS[coreIndex], shadowColor: COLORS[coreIndex] }]} />}
              {same(point, vault.exit) && <View style={[styles.exit, installedCount === 3 && styles.exitOn]} />}
              {vault.pads.some((pad) => same(pad, point)) && <View style={[styles.pad, padActive && styles.padOn]} />}
            </View>;
          })}
          {patrolActive && <><View style={[styles.patrolNext, { left: patrolNext.x * tile + tile * 0.22, top: patrolNext.y * tile + tile * 0.22, width: tile * 0.56, height: tile * 0.56 }]} /><View style={[styles.patrol, { left: patrolPosition.x * tile + tile * 0.25, top: patrolPosition.y * tile + tile * 0.25, width: tile * 0.5, height: tile * 0.5 }]} /></>}
          <View style={[styles.player, { left: player.x * tile + tile * 0.23, top: player.y * tile + tile * 0.23, width: tile * 0.54, height: tile * 0.54 }, carried !== null && { borderColor: COLORS[carried] }]} />
          {complete && <View style={styles.complete}><Text style={styles.completeKicker}>VAULT STABLE</Text><Text style={styles.completeTitle}>Machine awake.</Text><Pressable style={styles.nextButton} onPress={() => reset(vaultIndex === 0 ? 1 : 0)}><Text style={styles.nextText}>{vaultIndex === 0 ? "ENTER 14×14" : "LOOP VAULTS"}</Text></Pressable></View>}
        </View>
        <View style={styles.stageRow}>{COLORS.map((color, index) => <View key={color} style={styles.stage}><View style={[styles.stageDot, { borderColor: color }, installed[index] && { backgroundColor: color }]} /><Text style={styles.stageText}>{carried === index ? "CARRYING" : installed[index] ? "ONLINE" : `CORE ${index + 1}`}</Text></View>)}</View>
        <Text style={styles.hint}>{installedCount < 2 ? "THE SECOND CORE RELEASES THE PATROL AND POWERS BLINK PADS" : installedCount < 3 ? "PATROL ACTIVE / BLINK SHORTCUT ONLINE" : "EXIT POWERED / MOVE COUNTDOWN ACTIVE"}</Text>
        <View style={styles.controls}><Pressable onPress={() => reset(vaultIndex)} style={styles.button}><Text style={styles.buttonText}>RESET</Text></Pressable><Pressable onPress={() => reset(vaultIndex === 0 ? 1 : 0)} style={styles.button}><Text style={styles.buttonText}>{vaultIndex === 0 ? "14×14 VAULT" : "12×12 VAULT"}</Text></Pressable></View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:"#101714"},header:{height:54,paddingHorizontal:14,flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderBottomWidth:1,borderBottomColor:"#29362f"},back:{color:"#909a92",fontSize:9,fontWeight:"800",letterSpacing:.7},logo:{color:"#f0eadb",fontSize:10,fontWeight:"900",letterSpacing:1.4},room:{color:"#78857c",fontSize:8,fontWeight:"900"},content:{flex:1,alignItems:"center",padding:12},titleRow:{width:"100%",marginBottom:13,flexDirection:"row",justifyContent:"space-between"},kicker:{color:"#d4774c",fontSize:8,fontWeight:"900",letterSpacing:1},title:{marginTop:4,color:"#f0eadb",fontFamily:"serif",fontSize:29},copy:{marginTop:3,color:"#89958d",fontSize:9},metric:{alignItems:"flex-end"},metricLabel:{color:"#718077",fontSize:7,fontWeight:"900"},metricValue:{color:"#f0eadb",fontFamily:"serif",fontSize:27},escape:{color:"#ef8b6b"},metricSmall:{color:"#718077",fontSize:7,fontWeight:"800"},board:{position:"relative",overflow:"hidden",borderWidth:1,borderColor:"#3a4941",borderRadius:15,backgroundColor:"#15201b"},cell:{position:"absolute",alignItems:"center",justifyContent:"center",borderWidth:.35,borderColor:"#26342d"},wall:{backgroundColor:"#39453e",borderColor:"#4b5750"},door:{width:"72%",height:"22%",borderRadius:5,transform:[{rotate:"45deg"}]},doorOpen:{opacity:.15},relay:{width:"76%",height:"76%",borderRadius:6,borderWidth:1,borderColor:"#6e7b72",flexDirection:"row",alignItems:"center",justifyContent:"space-around",backgroundColor:"#26332c"},socket:{width:"22%",aspectRatio:1,borderWidth:1.5,borderRadius:99},core:{width:"38%",aspectRatio:1,borderRadius:99,shadowOpacity:1,shadowRadius:7},exit:{width:"62%",height:"62%",borderWidth:2,borderColor:"#647068",borderRadius:5,backgroundColor:"#34423a"},exitOn:{borderColor:"#a7d9b1",backgroundColor:"#4c805c"},pad:{width:"55%",height:"55%",borderWidth:2,borderColor:"#59675f",borderRadius:99,backgroundColor:"#34413a"},padOn:{borderColor:"#a98ac2",backgroundColor:"#684f7a"},player:{position:"absolute",zIndex:5,borderWidth:3,borderColor:"#fff0bf",borderRadius:99,backgroundColor:"#e7c477"},patrol:{position:"absolute",zIndex:4,borderWidth:2,borderColor:"#ff9a82",borderRadius:99,backgroundColor:"#a83f3b"},patrolNext:{position:"absolute",zIndex:3,borderWidth:1.5,borderColor:"#dc655b",borderRadius:99,backgroundColor:"rgba(189,78,72,.12)"},complete:{position:"absolute",inset:0,zIndex:8,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(10,17,14,.87)"},completeKicker:{color:"#d4ad69",fontSize:8,fontWeight:"900",letterSpacing:1},completeTitle:{marginTop:7,color:"#f0eadb",fontFamily:"serif",fontSize:34},nextButton:{marginTop:15,paddingHorizontal:15,paddingVertical:10,borderRadius:20,backgroundColor:"#eee3cf"},nextText:{color:"#152019",fontSize:8,fontWeight:"900",letterSpacing:.8},stageRow:{width:"100%",marginTop:12,flexDirection:"row",justifyContent:"space-around"},stage:{flexDirection:"row",alignItems:"center",gap:5},stageDot:{width:10,height:10,borderWidth:2,borderRadius:6},stageText:{color:"#87938a",fontSize:7,fontWeight:"900",letterSpacing:.4},hint:{marginTop:10,color:"#c07c61",fontSize:7,fontWeight:"900",letterSpacing:.55},controls:{width:"100%",marginTop:"auto",flexDirection:"row",justifyContent:"space-between"},button:{paddingHorizontal:13,paddingVertical:10,borderWidth:1,borderColor:"#46544c",borderRadius:18},buttonText:{color:"#b2bab3",fontSize:8,fontWeight:"900",letterSpacing:.6},
});
