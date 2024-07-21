const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const sequelize = require("./database");
require("dotenv").config();

const userRoutes = require("./Router/user");
const patientRoutes = require("./Router/patient");

const Patient = require("./models/Patient");
const Chat = require("./models/Chat");
const UserResults = require("./models/UserResults");

const { v4: uuidv4 } = require('uuid');

const {
  function_to_call,
  getSummaryAndQuestion,
  previousChats,
  previouslyAttempted,
  fetchChats,
  fetchCurrentMaximumScore,
  testAnswered,
  diagnosisAnswered
} = require("./utils");

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/users", userRoutes);
app.use("/patient", patientRoutes);

io.on("connection", async (socket) => {
  socket.on("join-room", async (roomId) => {
    console.log(`User Joined room : ${roomId}`);

    try {
      const [userId, patientId] = roomId.split("_");

      const patient = await Patient.findByPk(patientId);

      const briefSummary =
        (await getSummaryAndQuestion(patient.patientSummary)) +
        `\n\nLets go to the Lab to Diagnose Further.What Test should we Run?`;

        // console.log(briefSummary)

      const havePreviousChats = await previousChats(roomId);
      const haveAttempted = await previouslyAttempted(userId,patientId);

      const isTestAnswered = await testAnswered(patientId,userId);
      const isDiagnosisAnswered = await diagnosisAnswered(patientId,userId)

      // console.log(havePreviousChats===false,haveAttempted,isTestAnswered,isDiagnosisAnswered)

      if (!haveAttempted) {
        const userResult = await UserResults.create({
          patientId: patientId,
          userId: userId,
          testPoint: 5,
          diagnosisPoint: 5,
        });
      } 

      const question = {
        id: uuidv4(),
        text: briefSummary,
        isAI: true,
      };

      if (patient) {
        socket.emit("patient-info", question);
        if(havePreviousChats){
          const previousChats = await fetchChats(roomId)
          const chats = previousChats.map((item)=>{
            return {
              id : uuidv4(),
              text : item.message,
              isAI:item.isAI
            }
          })
          socket.emit('previous-chats',chats)
          socket.emit('question-answered',isTestAnswered && isDiagnosisAnswered)
        }
      } else {
        socket.emit("patient-info", "Patient Not Found");
      }
    } catch (err) {
      console.log(err)
      socket.emit("patient-info", `Error Fetching Patient`);
    }
  });

  socket.on("send-chat", async (data) => {
    const { roomId, message, patientId } = data;
    console.log(roomId)

    // Here We have to save chat in DB

    const chat_from_user = await Chat.create({
      roomId: roomId,
      message: message,
      isAI: false,
    });

    const response = await function_to_call({
      patientId: patientId,
      message: message,
    });

    // const generateRandomId = () => '_' + Math.random().toString(36).substr(2, 9);

    const answer = {
      id: uuidv4(),
      text: response,
      isAI: true,
    };

    const chat_from_AI = await Chat.create({
      roomId: roomId,
      message: response,
      isAI: true,
    });

    

    const [userId, patientid] = roomId.split("_");

    const isTestAnswered = await testAnswered(patientId,userId);
    const isDiagnosisAnswered = await diagnosisAnswered(patientId,userId)

    const score = await fetchCurrentMaximumScore(patientId,userId)

    socket.emit('current-maximum-score',score)
    socket.emit("response-fromAI", answer);
    socket.emit('question-answered',isTestAnswered && isDiagnosisAnswered)
  });

  socket.on("disconnect", () => {
    socket.disconnect();
    console.log("A user Disconnected");
  });
});

const Port = process.env.PORT;

sequelize
  .authenticate()
  .then(() => {
    console.log("Database Connected");
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    server.listen(Port, () => {
      console.log("App is running on Port", Port);
    });
  })
  .catch((err) => {
    console.log("Error Connecting Database", err);
  });
