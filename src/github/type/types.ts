import { getOctokit } from "@actions/github";

export type Octokit = ReturnType<typeof getOctokit>;

export interface Issue {
  number: number;
  title: string;
  user: {
    login: string;
  } | null;
  labels?: Array<string | { name: string }>;
}

export interface IssueClassification {
  completed: Issue[];
  inProgress: Issue[];
  pending: Issue[];
}

export interface RepoContext {
  owner: string;
  repo: string;
}
