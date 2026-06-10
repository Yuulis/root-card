"""Automate creating and pushing a release branch.

The branch push triggers GitHub Actions to build and create a release.
"""

import re
import subprocess
import sys

VERSION_PATTERN = r"^v\d+\.\d+\.\d+$"
REQUIRED_BRANCH = "master"


def print_error(message: str) -> None:
    """Print an error message to stderr."""
    print(f"Error: {message}", file=sys.stderr)


def run_git(*args: str) -> subprocess.CompletedProcess[str]:
    """Run a git command and return the result."""
    return subprocess.run(
        ["git", *args],
        check=True,
        capture_output=True,
        text=True,
    )


def validate_version(version: str) -> bool:
    """Validate that version matches the required pattern."""
    return re.match(VERSION_PATTERN, version) is not None


def get_current_branch() -> str:
    """Get the name of the current git branch."""
    result = run_git("rev-parse", "--abbrev-ref", "HEAD")
    return result.stdout.strip()


def is_working_tree_clean() -> bool:
    """Check if the git working tree is clean."""
    result = run_git("status", "--porcelain")
    return result.stdout.strip() == ""


def create_release(version: str) -> None:
    """Create a release branch and push it to trigger GitHub Actions."""
    # Validate version format
    if not validate_version(version):
        print_error(
            f"Invalid version format: '{version}'. "
            f"Expected format: v<major>.<minor>.<patch> (e.g. v1.0.0)"
        )
        sys.exit(1)

    # Ensure we are on the required branch
    current_branch = get_current_branch()
    if current_branch != REQUIRED_BRANCH:
        print_error(
            f"Must be on '{REQUIRED_BRANCH}' branch. "
            f"Currently on '{current_branch}'."
        )
        sys.exit(1)

    # Ensure working tree is clean
    if not is_working_tree_clean():
        print_error(
            "Working tree is not clean. "
            "Please commit or stash your changes before creating a release."
        )
        sys.exit(1)

    branch_name = f"release/{version}"

    # Create release branch from current HEAD
    print(f"Creating branch '{branch_name}'...")
    run_git("checkout", "-b", branch_name)

    # Push the branch to origin
    print(f"Pushing '{branch_name}' to origin...")
    run_git("push", "-u", "origin", branch_name)

    # Return to master
    print(f"Returning to '{REQUIRED_BRANCH}' branch...")
    run_git("checkout", REQUIRED_BRANCH)

    # Success message
    print()
    print(f"Release branch '{branch_name}' has been pushed to origin.")
    print("GitHub Actions will build and create the release automatically.")


def main() -> None:
    """Entry point for the release script."""
    if len(sys.argv) != 2:
        print(f"Usage: python {sys.argv[0]} <version>")
        print(f"  version: Version tag (e.g. v1.0.0)")
        sys.exit(1)

    version = sys.argv[1]
    create_release(version)


if __name__ == "__main__":
    main()
