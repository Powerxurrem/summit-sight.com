import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type Point = { x: number; y: number };
type Direction = { dx: number; dy: number };
type Room = { name: string; map: string[]; copy: string; steps: number; echoMoves?: number };

const ROOMS: Room[] = [
  {
    name: "First Memory",
    copy: "Record four right moves. Wall bumps still count.",
    steps: 4,
    map: ["########", "#S..R..#", "#.####D#", "######E#", "########", "#G...P.#", "#......#", "########"],
  },
  {
    name: "Move the Problem",
    copy: "Push the crate down, then program the echo.",
    steps: 4,
    map: ["#########", "#S......#", "#.##.##.#", "#...B.D.#", "#.##.##E#", "#R.....##", "#G...P..#", "#.......#", "#########"],
  },
  {
    name: "Bad Instructions",
    copy: "The shortest route is not the useful recording.",
    steps: 4,
    map: ["#########", "#S..#...#", "#...#B..#", "#R....D.#", "###.###E#", "#G..P#.##", "#.......#", "#.......#", "#########"],
  },
  {
    name: "Long Exposure",
    copy: "Five clean moves wake the far side of the room.",
    steps: 5,
    map: ["##########", "#S.R.....#", "#.######.#", "#........#", "######D###", "#.....E..#", "#G....P..#", "#........#", "##########"],
  },
  {
    name: "Second Opinion",
    copy: "One memory, one crate. Both plates must stay held.",
    steps: 4,
    map: ["#########", "#S.R....#", "#.##.##.#", "#.B.P...#", "#####D###", "#....E..#", "#G...P..#", "#.......#", "#########"],
  },
  {
    name: "Heavy Memory",
    copy: "Two crates hold the circuit while a longer echo runs.",
    steps: 6,
    map: ["##########", "#S.R.....#", "#........#", "#.B.P....#", "#.B.P....#", "######D###", "#.....E..#", "#G.....P.#", "#........#", "##########"],
  },
  {
    name: "Ceiling Thoughts",
    copy: "The echo fades after ten moves. Waste none of them.",
    steps: 5,
    echoMoves: 10,
    map: ["##########", "#SR......#", "#........#", "#.B.P....#", "######D###", "#...P.E..#", "#........#", "#G.......#", "#........#", "##########"],
  },
  {
    name: "Three Witnesses",
    copy: "Three plates, seven instructions and nine moves to escape.",
    steps: 7,
    echoMoves: 9,
    map: ["###########", "#SR.......#", "#.........#", "#.B.P.....#", "#.B..P....#", "#######D###", "#....P.E..#", "#.........#", "#.........#", "#G........#", "###########"],
  },
  {
    name: "Reverse Recall",
    copy: "Build the circuit, record backwards, then take the clean route.",
    steps: 7,
    echoMoves: 10,
    map: ["###########", "#.......RS#", "#.........#", "#..B.P....#", "#..B..P...#", "###D#######", "#.......G.#", "#.........#", "#..P..E...#", "#.........#", "###########"],
  },
  {
    name: "Difference of Opinion",
    copy: "Blue obeys. Red takes every instruction the other way.",
    steps: 4,
    map: ["###########", "#SR.......#", "#.........#", "#.........#", "#####D#####", "#....E....#", "#..P......#", "#.G....H..#", "#.....P...#", "###########"],
  },
  {
    name: "Crossed Wires",
    copy: "One instruction list. Two entirely different journeys.",
    steps: 5,
    map: ["###########", "#SR.......#", "#.........#", "#.........#", "#####D#####", "#....E....#", "#.........#", "#.GP..PH..#", "#.........#", "###########"],
  },
  {
    name: "Long Argument",
    copy: "Both echoes need six instructions. Neither agrees on order.",
    steps: 6,
    echoMoves: 10,
    map: ["###########", "#SR.......#", "#.........#", "#.........#", "#.........#", "#####D#####", "#....EP...#", "#G........#", "#.......H.#", "#..P......#", "###########"],
  },
  {
    name: "Poltergeist",
    copy: "The crate is sealed away. Your echo can still reach it.",
    steps: 4,
    map: ["###########", "#SR.......#", "#.........#", "#.........#", "#####D#####", "#....E....#", "#.........#", "#G.B.P#...#", "#.........#", "###########"],
  },
  {
    name: "Do It Again",
    copy: "The first memory moves the crate. The second holds the gate.",
    steps: 4,
    map: ["###########", "#SR.......#", "#.........#", "#.........#", "#####D#####", "#....E....#", "#.........#", "#G.B.P#...#", "#P#####...#", "###########"],
  },
  {
    name: "Two-Stage Haunting",
    copy: "Push right. Reset the memory. Push down. Then leave.",
    steps: 4,
    echoMoves: 9,
    map: ["############", "#SR........#", "#..........#", "#..........#", "######D#####", "#.....E....#", "#.G.B.P#...#", "#.B........#", "#..........#", "#..........#", "#.P........#", "############"],
  },
];

const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
const find = (map: string[], symbol: string): Point => {
  for (let y = 0; y < map.length; y += 1) {
    const x = map[y].indexOf(symbol);
    if (x >= 0) return { x, y };
  }
  return { x: 1, y: 1 };
};

const findAll = (map: string[], symbols: string[]): Point[] => map.flatMap((row, y) => [...row]
  .map((cell, x) => symbols.includes(cell) ? { x, y } : null)
  .filter((point): point is Point => point !== null));

export default function EchoRoomsScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [roomIndex, setRoomIndex] = useState(0);
  const room = ROOMS[roomIndex];
  const start = useMemo(() => find(room.map, "S"), [room]);
  const ghostStarts = useMemo(() => findAll(room.map, ["G", "H"]), [room]);
  const recorder = useMemo(() => find(room.map, "R"), [room]);
  const plates = useMemo(() => room.map.flatMap((row, y) => [...row].map((cell, x) => cell === "P" ? { x, y } : null).filter((point): point is Point => point !== null)), [room]);
  const exit = useMemo(() => find(room.map, "E"), [room]);
  const initialBoxes = useMemo(() => room.map.flatMap((row, y) => [...row].map((cell, x) => cell === "B" ? { x, y } : null).filter((point): point is Point => point !== null)), [room]);
  const [player, setPlayer] = useState(start);
  const [ghosts, setGhosts] = useState(ghostStarts);
  const [boxes, setBoxes] = useState(initialBoxes);
  const [recording, setRecording] = useState(false);
  const [sequence, setSequence] = useState<Direction[]>([]);
  const [replaying, setReplaying] = useState(false);
  const [echoMovesLeft, setEchoMovesLeft] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [complete, setComplete] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ghostsRef = useRef(ghostStarts);
  const boxesRef = useRef(initialBoxes);
  const heldPlates = plates.filter((plate) => ghosts.some((ghost) => same(ghost, plate)) || same(player, plate) || boxes.some((box) => same(box, plate))).length;
  const doorOpen = heldPlates === plates.length;
  const columns = room.map[0].length;
  const boardSize = Math.min(width - 26, height - insets.top - insets.bottom - 255, 440);
  const tile = boardSize / Math.max(columns, room.map.length);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const reset = useCallback((nextIndex = roomIndex) => {
    clearTimers();
    const nextRoom = ROOMS[nextIndex];
    setRoomIndex(nextIndex);
    setPlayer(find(nextRoom.map, "S"));
    const nextGhosts = findAll(nextRoom.map, ["G", "H"]);
    const nextBoxes = findAll(nextRoom.map, ["B"]);
    ghostsRef.current = nextGhosts;
    boxesRef.current = nextBoxes;
    setGhosts(nextGhosts);
    setBoxes(nextBoxes);
    setRecording(false);
    setSequence([]);
    setReplaying(false);
    setEchoMovesLeft(null);
    setMoves(0);
    setComplete(false);
  }, [clearTimers, roomIndex]);

  useEffect(() => clearTimers, [clearTimers]);

  const replay = useCallback((instructions: Direction[]) => {
    setReplaying(true);
    ghostsRef.current = ghostStarts;
    setGhosts(ghostStarts);
    const tracks = ghostStarts.map((_, ghostIndex) => ghostIndex === 0
      ? instructions
      : instructions.map((instruction) => ({ dx: -instruction.dx, dy: -instruction.dy })));
    instructions.forEach((instruction, index) => {
      const timer = setTimeout(() => {
        const nextGhosts = ghostsRef.current.map((current, ghostIndex) => {
          const direction = tracks[ghostIndex][index];
          const next = { x: current.x + direction.dx, y: current.y + direction.dy };
          if (room.map[next.y]?.[next.x] === "#" || room.map[next.y]?.[next.x] === "D") return current;
          const boxIndex = boxesRef.current.findIndex((box) => same(box, next));
          if (boxIndex >= 0) {
            const beyond = { x: next.x + direction.dx, y: next.y + direction.dy };
            const beyondType = room.map[beyond.y]?.[beyond.x];
            if (!beyondType || beyondType === "#" || beyondType === "D" || boxesRef.current.some((box) => same(box, beyond))) return current;
            const nextBoxes = boxesRef.current.map((box, currentIndex) => currentIndex === boxIndex ? beyond : box);
            boxesRef.current = nextBoxes;
            setBoxes(nextBoxes);
          }
          return next;
        });
        ghostsRef.current = nextGhosts;
        setGhosts(nextGhosts);
        Haptics.selectionAsync();
      }, 220 * (index + 1));
      timers.current.push(timer);
    });
    timers.current.push(setTimeout(() => {
      setReplaying(false);
      setEchoMovesLeft(room.echoMoves ?? null);
    }, 220 * (instructions.length + 1)));
  }, [ghostStarts, room]);

  const move = useCallback((direction: Direction) => {
    if (complete || replaying) return;
    let nextSequence = sequence;
    if (recording) {
      nextSequence = [...sequence, direction];
      setSequence(nextSequence);
      if (nextSequence.length >= room.steps) {
        setRecording(false);
        replay(nextSequence.slice(0, room.steps));
      }
    }

    const next = { x: player.x + direction.dx, y: player.y + direction.dy };
    const tileType = room.map[next.y]?.[next.x];
    if (!tileType || tileType === "#" || (tileType === "D" && !doorOpen)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      return;
    }
    const boxIndex = boxes.findIndex((box) => same(box, next));
    if (boxIndex >= 0) {
      const beyond = { x: next.x + direction.dx, y: next.y + direction.dy };
      const beyondType = room.map[beyond.y]?.[beyond.x];
      const occupied = boxes.some((box) => same(box, beyond));
      if (!beyondType || beyondType === "#" || beyondType === "D" || occupied) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
      const nextBoxes = boxes.map((box, index) => index === boxIndex ? beyond : box);
      boxesRef.current = nextBoxes;
      setBoxes(nextBoxes);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.selectionAsync();
    }
    setPlayer(next);
    setMoves((value) => value + 1);
    if (same(next, recorder)) {
      clearTimers();
      ghostsRef.current = ghostStarts;
      setGhosts(ghostStarts);
      setEchoMovesLeft(null);
      setRecording(true);
      setSequence([]);
      setReplaying(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (same(next, exit)) {
      setComplete(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (echoMovesLeft !== null && !same(next, recorder)) {
      const remaining = echoMovesLeft - 1;
      if (remaining <= 0) {
        setEchoMovesLeft(null);
        ghostsRef.current = ghostStarts;
        setGhosts(ghostStarts);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        setEchoMovesLeft(remaining);
      }
    }
  }, [boxes, clearTimers, complete, doorOpen, echoMovesLeft, exit, ghostStarts, player, recorder, recording, replay, replaying, room, sequence]);

  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !complete,
    onMoveShouldSetPanResponder: () => !complete,
    onPanResponderRelease: (_, gesture) => {
      if (Math.max(Math.abs(gesture.dx), Math.abs(gesture.dy)) < 25) return;
      if (Math.abs(gesture.dx) > Math.abs(gesture.dy)) move({ dx: gesture.dx > 0 ? 1 : -1, dy: 0 });
      else move({ dx: 0, dy: gesture.dy > 0 ? 1 : -1 });
    },
  }), [complete, move]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/maze-hub")}><Text style={styles.back}>{"< PUZZLE WING"}</Text></Pressable>
        <Text style={styles.logo}>ECHO ROOMS</Text>
        <Text style={styles.roomNumber}>{roomIndex + 1}/{ROOMS.length}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}><View><Text style={styles.kicker}>PUZZLE LAB / MEMORY</Text><Text style={styles.title}>{room.name}</Text><Text style={styles.copy}>{room.copy}</Text></View><View style={styles.moves}><Text style={styles.movesLabel}>MOVES</Text><Text style={styles.movesValue}>{moves}</Text></View></View>
        <View style={[styles.board, { width: columns * tile, height: room.map.length * tile }]} {...responder.panHandlers}>
          {room.map.flatMap((row, y) => [...row].map((cell, x) => {
            const wall = cell === "#";
            return <View key={`${x}-${y}`} style={[styles.cell, { left: x * tile, top: y * tile, width: tile, height: tile }, wall && styles.wall]}>
              {cell === "R" && <View style={[styles.recorder, recording && styles.recorderOn]} />}
              {cell === "P" && <View style={[styles.plate, (ghosts.some((ghost) => same(ghost, { x, y })) || same(player, { x, y }) || boxes.some((box) => same(box, { x, y }))) && styles.plateOn]} />}
              {cell === "D" && <View style={[styles.door, doorOpen && styles.doorOpen]} />}
              {cell === "E" && <View style={styles.exit} />}
            </View>;
          }))}
          {boxes.map((box, index) => <View key={`box-${index}`} style={[styles.box, { left: box.x * tile + tile * 0.18, top: box.y * tile + tile * 0.18, width: tile * 0.64, height: tile * 0.64 }]} />)}
          {ghosts.map((ghost, index) => <View key={`ghost-${index}`} style={[styles.ghost, index === 1 && styles.reverseGhost, { left: ghost.x * tile + tile * 0.25, top: ghost.y * tile + tile * 0.25, width: tile * 0.5, height: tile * 0.5 }]} />)}
          <View style={[styles.player, { left: player.x * tile + tile * 0.22, top: player.y * tile + tile * 0.22, width: tile * 0.56, height: tile * 0.56 }]} />
          {complete && <View style={styles.complete}><Text style={styles.completeKicker}>ROOM SOLVED</Text><Text style={styles.completeTitle}>Memory held.</Text><Pressable style={styles.nextButton} onPress={() => reset((roomIndex + 1) % ROOMS.length)}><Text style={styles.nextText}>{roomIndex + 1 < ROOMS.length ? "NEXT ROOM" : "LOOP ROOMS"}</Text></Pressable></View>}
        </View>
        <View style={styles.status}><Text style={[styles.statusText, recording && styles.statusHot, echoMovesLeft !== null && styles.statusUrgent]}>{replaying ? "ECHO REPLAYING..." : recording ? `RECORDING ${sequence.length}/${room.steps}` : doorOpen && echoMovesLeft !== null ? `GATE OPEN / ECHO FADES IN ${echoMovesLeft} MOVES` : doorOpen ? "ALL PLATES HELD / GATE OPEN" : heldPlates > 0 ? `${heldPlates}/${plates.length} PLATES HELD` : "STEP ON THE AMBER RECORDER"}</Text></View>
        <View style={styles.legend}><Text style={styles.legendText}>AMBER = RECORD</Text><Text style={styles.legendText}>BLUE = FORWARD</Text>{ghosts.length > 1 && <Text style={styles.legendText}>RED = OPPOSITE</Text>}<Text style={styles.legendText}>ALL PURPLE = GATE</Text><Text style={styles.legendText}>BLOCKS CAN BE PUSHED</Text></View>
        <View style={styles.roomControls}><Pressable disabled={roomIndex === 0} onPress={() => reset(roomIndex - 1)} style={[styles.roomButton, roomIndex === 0 && styles.disabled]}><Text style={styles.roomButtonText}>PREVIOUS</Text></Pressable><Pressable onPress={() => reset(roomIndex)} style={styles.roomButton}><Text style={styles.roomButtonText}>RESET</Text></Pressable><Pressable disabled={roomIndex === ROOMS.length - 1} onPress={() => reset(roomIndex + 1)} style={[styles.roomButton, roomIndex === ROOMS.length - 1 && styles.disabled]}><Text style={styles.roomButtonText}>NEXT</Text></Pressable></View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#101714" }, header: { height: 54, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#29362f" }, back: { color: "#909a92", fontSize: 9, fontWeight: "800", letterSpacing: 0.7 }, logo: { color: "#f0eadb", fontSize: 10, fontWeight: "900", letterSpacing: 1.4 }, roomNumber: { color: "#77847b", fontSize: 8, fontWeight: "900" },
  content: { flex: 1, alignItems: "center", padding: 14 }, titleRow: { width: "100%", marginBottom: 16, flexDirection: "row", justifyContent: "space-between" }, kicker: { color: "#d4774c", fontSize: 8, fontWeight: "900", letterSpacing: 1 }, title: { marginTop: 4, color: "#f0eadb", fontFamily: "serif", fontSize: 30 }, copy: { marginTop: 4, maxWidth: 260, color: "#89958d", fontSize: 10 }, moves: { alignItems: "flex-end" }, movesLabel: { color: "#718077", fontSize: 7, fontWeight: "900" }, movesValue: { color: "#f0eadb", fontFamily: "serif", fontSize: 27 },
  board: { position: "relative", overflow: "hidden", borderWidth: 1, borderColor: "#3b4a42", borderRadius: 16, backgroundColor: "#15201b" }, cell: { position: "absolute", borderWidth: 0.5, borderColor: "#29372f", alignItems: "center", justifyContent: "center" }, wall: { backgroundColor: "#344139", borderColor: "#46544c" }, recorder: { width: "48%", height: "48%", borderRadius: 7, borderWidth: 2, borderColor: "#e6a95d", backgroundColor: "rgba(180,112,52,.28)" }, recorderOn: { backgroundColor: "#c57842", shadowColor: "#f2b567", shadowOpacity: 1, shadowRadius: 9 }, plate: { width: "56%", height: "20%", borderRadius: 8, borderWidth: 2, borderColor: "#a986be", backgroundColor: "#493b56" }, plateOn: { borderColor: "#90d5cf", backgroundColor: "#457d75" }, door: { width: "18%", height: "100%", backgroundColor: "#70d5dc", shadowColor: "#70d5dc", shadowOpacity: 1, shadowRadius: 8 }, doorOpen: { opacity: 0.14 }, exit: { width: "58%", height: "58%", borderRadius: 7, borderWidth: 2, borderColor: "#a2d4ad", backgroundColor: "#416c50" },
  box: { position: "absolute", zIndex: 3, borderWidth: 2, borderColor: "#d6a965", borderRadius: 5, backgroundColor: "#72573a", transform: [{ rotate: "4deg" }] }, ghost: { position: "absolute", zIndex: 4, borderWidth: 2, borderColor: "#a9e1e2", borderRadius: 999, backgroundColor: "rgba(86,164,170,.48)" }, reverseGhost: { borderColor: "#f1a29a", backgroundColor: "rgba(184,73,70,.5)" }, player: { position: "absolute", zIndex: 5, borderWidth: 3, borderColor: "#fff0bf", borderRadius: 999, backgroundColor: "#e7c477" }, complete: { position: "absolute", inset: 0, zIndex: 8, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(10,17,14,.86)" }, completeKicker: { color: "#d4ad69", fontSize: 8, fontWeight: "900", letterSpacing: 1 }, completeTitle: { marginTop: 7, color: "#f0eadb", fontFamily: "serif", fontSize: 34 }, nextButton: { marginTop: 15, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, backgroundColor: "#eee3cf" }, nextText: { color: "#152019", fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  status: { marginTop: 14, paddingHorizontal: 13, paddingVertical: 9, borderWidth: 1, borderColor: "#35433b", borderRadius: 18 }, statusText: { color: "#849188", fontSize: 8, fontWeight: "900", letterSpacing: 0.7 }, statusHot: { color: "#efb06e" }, statusUrgent: { color: "#ef8c72" }, legend: { width: "100%", marginTop: 14, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10 }, legendText: { color: "#6f7d74", fontSize: 7, fontWeight: "800", letterSpacing: 0.4 }, roomControls: { width: "100%", marginTop: "auto", flexDirection: "row", justifyContent: "space-between" }, roomButton: { paddingHorizontal: 13, paddingVertical: 10, borderWidth: 1, borderColor: "#46544c", borderRadius: 18 }, roomButtonText: { color: "#b2bab3", fontSize: 8, fontWeight: "900", letterSpacing: 0.6 }, disabled: { opacity: 0.22 },
});
