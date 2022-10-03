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
    console.info("validating:", editor.document.uri);

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

    return process.then(function (stdout) {
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
  registration = nova.assistants.registerIssueAssistant(
    { syntax: "yaml" },
    new IssuesProvider()
  );
};

export const deactivate = (): void => {
  if (registration) {
    registration.dispose();
    registration = null;
  }
};
