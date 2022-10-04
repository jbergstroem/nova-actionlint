type ActionlintOutput = {
  message: string;
  kind: string;
  snippet: string;
  line: number;
  column: number;
  end_column?: number;
};

class IssuesProvider {
  provideIssues(editor: TextEditor): AssistantArray<Issue> {
    const relativePath: string = editor.document.path.replace(
      nova.workspace.path,
      ""
    );
    console.info(`Evaluating: ${editor.document.uri}`);
    const path: string[] = nova.config.get("actionlint.searchpath", "array");
    if (!path.find((element) => relativePath.includes(element))) {
      console.info(`Skipping: ${relativePath} - doesn't match config path`);
      return;
    }

    const documentLength = editor.document.length;
    const content = editor.document.getTextInRange(
      new Range(0, documentLength)
    );

    const process: Promise<string> = new Promise((resolve) => {
      const process = new Process("actionlint", {
        shell: true,
        args: ["-format", "{{json .}}", "-"],
      });

      let buffer = "";
      process.onStdout((line) => {
        buffer = buffer + line;
      });

      process.onStderr((line) => {
        console.warn(line);
      });

      process.onDidExit(() => {
        resolve(buffer);
      });

      process.start();

      const stdin = process.stdin as WritableStream;
      if (stdin) {
        const writer = stdin.getWriter();
        writer.write(content);
        writer.close();
      } else {
        console.error("no `stdin` configured");
      }
    });

    return process.then((stdout) => {
      return JSON.parse(stdout).map(function (
        data: ActionlintOutput,
        i: number
      ) {
        console.info(`input ${i}: ${data.message}`);

        const issue = new Issue();

        issue.message = data.message;
        issue.severity = IssueSeverity.Error;
        issue.line = data.line;
        issue.column = data.column;
        // this is only available in newer versions (1.6.20 and up)
        // https://github.com/rhysd/actionlint/commit/57c7c7d921792984353a1458cb419a2b5e206cfc
        issue.endColumn = data?.end_column;

        return issue;
      });
    });
  }
}

let registration: Disposable | null = null;

export const activate = (): void => {
  const process = new Process("command", {
    shell: true,
    stdio: "ignore",
    args: ["-v", "actionlint"],
  });

  process.onDidExit((status) => {
    if (status === 0) {
      registration = nova.assistants.registerIssueAssistant(
        { syntax: "yaml" },
        new IssuesProvider()
      );
    } else {
      const request = new NotificationRequest("actionlint-not-found");

      request.title = nova.localize("Actionlint not found");
      request.body = nova.localize(
        "Couldn't locate the actionlint binary. Check $PATH and try again."
      );

      nova.notifications.add(request);
    }
  });
  process.start();
};

export const deactivate = (): void => {
  if (registration) {
    registration.dispose();
    registration = null;
  }
};
