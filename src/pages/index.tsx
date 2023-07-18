import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRef, useState } from "react";
import { Header } from "~/components/Header";
import { api, type RouterOutputs } from "~/utils/api";
import { supabase } from "~/utils/supabase";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  return (
    <>
      <Head>
        <title>Teacher Assignment App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Header />
        <Content />
      </main>
    </>
  );
}

type Week = RouterOutputs["week"]["getAll"][0];
// type Assignment = RouterOutputs["assignment"]["getAll"][0];

function Content() {
  const [weekInput, setWeekInput] = useState<number>(0);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [assignmentTitle, setAssignmentTitle] = useState<string>("");
  const [assignmentContent, setAssignmentContent] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();

  const { data: sessionData } = useSession();
  const { data: weeks, refetch: refetchWeeks } = api.week.getAll.useQuery(
    undefined, // no input
    {
      enabled: sessionData?.user !== undefined,
      onSuccess: (data) => {
        setSelectedWeek(selectedWeek ?? data[0] ?? null);
      },
    }
  );

  const { data: assignments, refetch: refetchAssignments } =
    api.assignment.getAll.useQuery(
      {
        weekId: selectedWeek?.id ?? "",
      },
      {
        enabled: sessionData?.user !== undefined,
      }
    );

  const createWeek = api.week.create.useMutation({
    onSuccess: () => {
      void refetchWeeks();
    },
  });

  const createAssignment = api.assignment.createWithFile.useMutation({
    onSuccess: () => {
      void refetchAssignments();
    },
  });

  const deleteAssignments = api.assignment.deleteAll.useMutation({
    onSuccess: () => {
      void refetchAssignments();
    },
  });

  const handleAssignmentSubmit = async () => {
    if (!file || !selectedWeek || !sessionData) return;

    const fileExtensionArray: string[] | undefined = file?.name.split(".");
    if (!fileExtensionArray) return;

    const fileExtension: string | undefined = fileExtensionArray[1];
    if (!fileExtension) return;

    const { data: supabaseFileData } = await supabase.storage
      .from("teacher-files")
      .upload(sessionData.user.id + "/" + uuidv4() + "." + fileExtension, file);

    const fileURL = supabaseFileData?.path.split("/")[1];
    if (!fileURL) return;

    createAssignment.mutate({
      title: assignmentTitle,
      content: assignmentContent,
      weekId: selectedWeek.id,
      file: fileURL,
    });

    setAssignmentTitle("");
    setAssignmentContent("");
    resetFileInput();
  };

  const downloadFile = async (fileURL: string) => {
    if (!sessionData) return;
    const { data } = await supabase.storage
      .from("teacher-files")
      .download(sessionData.user.id + "/" + fileURL);

    if (!data) return;
    const url = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileURL;
    link.click();
  };

  const resetFileInput = () => {
    // 👇️ reset input value
    if (!inputRef.current) return;
    inputRef.current.value = "";
  };

  return (
    <div className="flex justify-center p-6 text-lg">
      <div className="ml-7 flex w-1/3 flex-col">
        <section className="mb-5">
          <ul className="menu rounded-box bg-base-100">
            {weeks?.map((week) => (
              <li key={week.id} className="text-lg">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedWeek(week);
                  }}
                >
                  Week {week.weekNumber}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-4 gap-4">
            <input
              type="number"
              placeholder="Week number"
              className="input-m input-bordered input w-full "
              onChange={(e) => setWeekInput(parseInt(e.currentTarget.value))}
            />
            <div className="navbar-end">
              <a
                className="btn"
                onClick={() => {
                  if (weekInput < 1) return;
                  createWeek.mutate({
                    weekNumber: weekInput,
                  });
                  setWeekInput(0);
                }}
              >
                Add week
              </a>
            </div>
          </div>
        </section>
        <section className="flex flex-col justify-center space-y-4">
          <input
            type="text"
            placeholder="Type Assignment Title"
            className="input-bordered input w-full max-w-xs"
            onChange={(e) => setAssignmentTitle(e.target.value)}
            value={assignmentTitle}
          />
          <textarea
            placeholder="Type Assignment Description"
            onChange={(e) => setAssignmentContent(e.target.value)}
            className="textarea-bordered textarea textarea-lg w-full max-w-xs"
            value={assignmentContent}
          />
          <input
            type="file"
            ref={inputRef}
            className="file-input-bordered file-input w-full max-w-xs"
            onChange={(e) => {
              if (e.target.files) void setFile(e.target.files[0]);
            }}
          />
          <button
            className="navbar"
            onClick={() => void handleAssignmentSubmit()}
          >
            <a className="btn">Add assignment</a>
          </button>

          <button className="navbar" onClick={() => deleteAssignments.mutate()}>
            <a className="btn">Delete Assignments</a>
          </button>
        </section>
      </div>
      <div className="flex w-2/3 flex-wrap">
        {assignments && assignments.length > 0 ? (
          assignments.map((assignment) => (
            <div
              className="card ml-5 mt-5 w-1/3 px-3 py-1 shadow-xl"
              key={assignment.id}
            >
              <div className="card-body">
                <h2 className="card-title">{assignment.title}</h2>
                <p>{assignment.content}</p>
                <div className="card-actions justify-end">
                  <button
                    className="btn-primary btn"
                    onClick={() => {
                      if (!assignment.fileURL) return;
                      void downloadFile(assignment.fileURL);
                    }}
                  >
                    Download File
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="">
            No Assignments in Week {selectedWeek?.weekNumber} yet.
          </p>
        )}
      </div>
    </div>
  );
}
