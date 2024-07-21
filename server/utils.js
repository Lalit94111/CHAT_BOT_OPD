const OpenAI = require("openai");
require("dotenv").config();

const Patient = require("./models/Patient");
const Solution = require("./models/Solution");
const UserResults = require("./models/UserResults");
const Chat = require("./models/Chat");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const match_test_or_diagonsis = async (name, args, patientId) => {
  try {
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return "Patient not found.";
    }

    const solution = await Solution.findOne({
      where: {
        patientId: patientId,
      },
    });
    if (!solution) {
      return "Solution not found.";
    }

    let proposed_answer;
    let correct_answer;

    const arguments = JSON.parse(args);
    if (name === "check_test") {
      console.log("Checking Test");
      const flag = await testAnswered(patientId, 1);
      if (flag) {
        return "You Have Answered Test Correctly, Please Answer Diagnosis Now";
      }
      proposed_answer = arguments.test_name;
      correct_answer = solution.correctTest;
    } else {
      console.log("Checking Diagnosis");
      const flag = await testAnswered(patientId, 1);
      if (!flag) {
        return "Please Answer Test First";
      }

      const diagnosis_answered = await diagnosisAnswered(patientId, 1);
      if (diagnosis_answered) {
        return "You have answered Diagnosis Correctly, can move to next question";
      }
      proposed_answer = arguments.diagnosis_name;
      correct_answer = solution.correctDiagnosis;
    }

    const patientDetails = patient.patientSummary;
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant designed to output JSON. Return output in this format {"match":"true/false"}`,
        },
        {
          role: "user",
          content: `Does these match, ${correct_answer} or ${proposed_answer}`,
        },
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });

    console.log(completion.choices[0].message.content);

    const data = JSON.parse(completion.choices[0].message.content);
    if (data.match === undefined) {
      console.error("Unexpected response format:", data);
      return "Error in response format.";
    }

    if (data.match === false) {
      if (name === "check_test") await reduceTestMarks(patientId, 1);
      else await reduceDiagnosisMarks(patientId, 1);
      return giveHints(proposed_answer, patientDetails);
    } else {
      if (name === "check_test") await markTestAnswered(patientId, 1);
      else await markDiagnosisAnswered(patientId, 1);

      if (name === "check_test")
        return "Test Answered Correctly, You can proceed with Diagnosis";
      return "Congratulations Challenge Solved, Correct Diagnosis";
    }
  } catch (error) {
    console.error("Error in match_test_or_diagnosis:", error);
    return "An error occurred.";
  }
};

const giveHints = async (proposed_answer, patientDetails) => {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant. State that the suggested test or diagnosis is incorrect and provide
         a JSON response with two fields: 'explanation' and 'hint'. 'explanation' should give a brief explanation about the patient's
          condition and the test given by the user, and 'hint' should provide a hint about the correct test or diagnosis without revealing it directly.`,
      },
      {
        role: "user",
        content: `The suggested test is ${proposed_answer} but the patient's condition is described as follows: ${patientDetails}`,
      },
    ],
    model: "gpt-3.5-turbo",
  });

  const { explanation, hint } = await JSON.parse(
    completion.choices[0].message.content
  );

  const result = `${explanation}\n\n${hint}`;

  return result;
};

const function_to_call = async ({ patientId, message }) => {
  const messages = [{ role: "user", content: message }];

  const tools = [
    {
      type: "function",
      function: {
        name: "check_test",
        description: "Run a specific medical test based on the test name",
        parameters: {
          type: "object",
          properties: {
            test_name: {
              type: "string",
              description:
                "The name of the test to run, e.g. CBC test, blood test, urine test",
            },
          },
          required: ["test_name"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "check_diagnosis",
        description: "Perform a diagnosis based on the diagnosis name",
        parameters: {
          type: "object",
          properties: {
            diagnosis_name: {
              type: "string",
              description:
                "The name of the diagnosis to perform, e.g. Diabetes diagnosis, Hypertension diagnosis",
            },
          },
          required: ["diagnosis_name"],
        },
      },
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
    tools: tools,
    tool_choice: "auto",
  });

  console.log(response.choices[0].message);

  const msg = response.choices[0].message;

  // Check if tool_calls array and its first element are present
  if (
    !msg.tool_calls ||
    !Array.isArray(msg.tool_calls) ||
    msg.tool_calls.length === 0
  ) {
    return "Please Enter Test or Diagnosis";
  }

  const firstCall = msg.tool_calls[0];

  // Check if the function object and its properties are present
  if (
    !firstCall.function ||
    !firstCall.function.name ||
    !firstCall.function.arguments
  ) {
    return "Please Enter Test or Diagnosis";
  }
  const name = firstCall.function.name;
  const args = firstCall.function.arguments;

  const output = await match_test_or_diagonsis(name, args, patientId);

  return output;
};

const createPatientSummary = async (patient) => {
  const messages = [
    {
      role: "system",
      content: `You are a helpful assistant specialized in medical summaries.Return output in JSON format {"summary":"<summary>"}`,
    },
    {
      role: "user",
      content: `Create a summary for you a patient with the following details(25 words) :
      Age: ${patient.age},
      Gender: ${patient.gender},
      History: ${patient.history},
      Symptoms: ${patient.symptoms},
      Additional Info: ${patient.additionalInfo}`,
    },
  ];

  const completion = await openai.chat.completions.create({
    messages: messages,
    model: "gpt-3.5-turbo",
    response_format: { type: "json_object" },
  });

  //   console.log(completion.choices[0].message.content);
  const data = await JSON.parse(completion.choices[0].message.content);
  return data.summary;
  // console.log(data);
  // return completion.choices[0].message.content;
};

const getSummaryAndQuestion = async (patientSummary) => {
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a helpful medical assistant.Return output in JSON format {"overview":"<overview>"}`,
        },
        {
          role: "user",
          content: `Generate a brief overview for the following patient condition (30 words): ${patientSummary}.`,
        },
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });

    const data = await JSON.parse(response.choices[0].message.content);
    return data.overview;
  } catch (error) {
    console.error("Error:", error);
  }
};

const testAnswered = async (patientId, userId) => {
  const user_result = await UserResults.findOne({
    where: {
      userId: userId,
      patientId: patientId,
    },
  });

  if (user_result) {
    return user_result.testAnswered;
  }

  return false;
};

const diagnosisAnswered = async (patientId, userId) => {
  const user_result = await UserResults.findOne({
    where: {
      userId: userId,
      patientId: patientId,
    },
  });

  if (user_result) {
    return user_result.diagnosisAnswered;
  }
  return false;
};

const previousChats = async (roomId) => {
  const chatExists = await Chat.findOne({
    where: {
      roomId: roomId,
    },
  });
  return chatExists !== null;
};

const previouslyAttempted = async (userId, patientId) => {
  const previousAttempt = await UserResults.findOne({
    where: {
      userId: userId,
      patientId: patientId,
    },
  });
  return previousAttempt;
};

const fetchChats = async (roomId) => {
  const previousChats = await Chat.findAll({
    where: {
      roomId: roomId,
    },
    order: [["createdAt", "ASC"]],
  });

  return previousChats;
};

const markTestAnswered = async (patientId, userId) => {
  const record = await UserResults.findOne({
    where: {
      patientId: patientId,
      userId: userId,
    },
  });

  if (record) {
    await UserResults.update(
      { testAnswered: true },
      {
        where: {
          patientId: patientId,
          userId: userId,
        },
      }
    );
  }
};

const markDiagnosisAnswered = async (patientId, userId) => {
  const record = await UserResults.findOne({
    where: {
      patientId: patientId,
      userId: userId,
    },
  });

  if (record) {
    await UserResults.update(
      { diagnosisAnswered: true },
      {
        where: {
          patientId: patientId,
          userId: userId,
        },
      }
    );
  }
};

const reduceTestMarks = async (patientId, userId) => {
  const record = await UserResults.findOne({
    where: {
      patientId: patientId,
      userId: userId,
    },
  });

  if (record) {
    const newTestPoint = Math.max(record.testPoint - 1, 1);
    await UserResults.update(
      { testPoint: newTestPoint },
      {
        where: {
          patientId: patientId,
          userId: userId,
        },
      }
    );
  }
};

const reduceDiagnosisMarks = async (patientId, userId) => {
  const record = await UserResults.findOne({
    where: {
      patientId: patientId,
      userId: userId,
    },
  });

  if (record) {
    const newdiagnosisPoint = Math.max(record.diagnosisPoint - 1, 1);
    await UserResults.update(
      { diagnosisPoint: newdiagnosisPoint },
      {
        where: {
          patientId: patientId,
          userId: userId,
        },
      }
    );
  }
};

const fetchCurrentMaximumScore = async (patientId, userId) => {
  try {
    const userResult = await UserResults.findOne({
      where: {
        patientId,
        userId,
      },
    });

    if (!userResult) {
      return { error: "No results found for the given patient and user." };
    }

    if (!userResult.testAnswered) {
      return { score: userResult.testPoint };
    } else {
      return { score: userResult.diagnosisPoint };
    }
  } catch (error) {
    console.error("Error fetching current maximum score:", error);
    return { error: "An error occurred while fetching the score." };
  }
};

module.exports = {
  function_to_call,
  match_test_or_diagonsis,
  createPatientSummary,
  getSummaryAndQuestion,
  testAnswered,
  diagnosisAnswered,
  previousChats,
  previouslyAttempted,
  fetchChats,
  fetchCurrentMaximumScore,
};
