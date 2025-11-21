import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from "react-native";
import { Accelerometer } from "expo-sensors";

const { width: W, height: H } = Dimensions.get("window");

const BALL_SIZE = 30;
const HOLE_SIZE = 60;
const CAPTURE_RADIUS = 80;
const CAPTURE_SPEED = 4;

export default function App() {
  const [ballX, setBallX] = useState(W / 2 - BALL_SIZE / 2);
  const [ballY, setBallY] = useState(H / 2 - BALL_SIZE / 2);
  const [isCaptured, setIsCaptured] = useState(false);
  const randomHole = () => ({
    x: Math.random() * (W - HOLE_SIZE),
    y: Math.random() * (H - HOLE_SIZE - 100),
  });

  const randomBall = () => ({
    x: Math.random() * (W - BALL_SIZE),
    y: Math.random() * (H - BALL_SIZE - 150),
  });

  const [hole, setHole] = useState(randomHole());
  const [score, setScore] = useState(0);
  const [lastScore, setLastScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const resetGame = () => {
    setBallX(W / 2 - BALL_SIZE / 2);
    setBallY(H / 2 - BALL_SIZE / 2);
    setHole(randomHole());
    setIsCaptured(false);
    setScore(0);
    setLastScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    Accelerometer.setUpdateInterval(50);

    const sub = Accelerometer.addListener(({ x, y }) => {
      if (isCaptured || gameOver) return;

      setBallX((prev) => Math.max(0, Math.min(prev - x * 30, W - BALL_SIZE)));
      setBallY((prev) => Math.max(0, Math.min(prev + y * 15, H - BALL_SIZE - 50)));
    });

    return () => sub.remove();
  }, [isCaptured, gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      if (score === lastScore) {
        setGameOver(true);
      } else {
        setLastScore(score);

        const newHole = randomHole();
        const newBall = randomBall();

        setHole(newHole);
        setBallX(newBall.x);
        setBallY(newBall.y);
        setIsCaptured(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [score, lastScore, gameOver]);
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      const holeCenterX = hole.x + HOLE_SIZE / 2;
      const holeCenterY = hole.y + HOLE_SIZE / 2;

      const ballCenterX = ballX + BALL_SIZE / 2;
      const ballCenterY = ballY + BALL_SIZE / 2;

      const dx = holeCenterX - ballCenterX;
      const dy = holeCenterY - ballCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < CAPTURE_RADIUS) {
        setIsCaptured(true);
        setBallX((prev) => prev + (dx / distance) * CAPTURE_SPEED);
        setBallY((prev) => prev + (dy / distance) * CAPTURE_SPEED);
      }
      const inside =
        ballX >= hole.x &&
        ballX + BALL_SIZE <= hole.x + HOLE_SIZE &&
        ballY >= hole.y &&
        ballY + BALL_SIZE <= hole.y + HOLE_SIZE;

      if (inside) {
        setScore((s) => s + 1);

        const newHole = randomHole();
        const newBall = randomBall();

        setHole(newHole);
        setBallX(newBall.x);
        setBallY(newBall.y);
        setIsCaptured(false);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [ballX, ballY, hole, gameOver]);

  return (
    <TouchableOpacity style={styles.container} onPress={() => gameOver && resetGame()}>
      <Text style={styles.score}>Score: {score}</Text>

      {gameOver && <Text style={styles.gameOverText}>GAME OVER </Text>}

      <View style={[styles.hole, { left: hole.x, top: hole.y }]} />
      <View style={[styles.ball, { left: ballX, top: ballY }]} />

      <StatusBar style="auto" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  score: {
    color: "#fff",
    fontSize: 26,
    marginTop: 40,
    textAlign: "center",
  },
  gameOverText: {
    color: "red",
    fontSize: 32,
    textAlign: "center",
    marginTop: 200,
    fontWeight: "bold",
  },
  ball: {
    position: "absolute",
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: "#00f",
  },
  hole: {
    position: "absolute",
    width: HOLE_SIZE,
    height: HOLE_SIZE,
    borderRadius: HOLE_SIZE / 2,
    backgroundColor: "#333",
    borderWidth: 4,
    borderColor: "#555",
  },
});
