const getAge = date => {
  return (new Date().getTime() - new Date(date).getTime()) / (60 * 60 * 24 * 1000)
}

const getPullRequestScore = (pullRequest, githubUser) => {
  // given:
  // - user != repo owner
  // - users can and will try to fake everything, from penis length and social status all the way down to pull requests
  // - naivety * negative energy = potential abuse
  // - critical factors: user reputation, repo reputation, repo owner reputation
  // assumptions:
  // - new user + new repo + new repo owner = fake
  // - new user + new repo + old repo owner = fake
  // - new user + old repo + old repo owner = equal chances to be fake or not
  // - old user + new repo + new repo owner = equal chances to be fake or not
  // - old user + new repo + old repo owner = fake
  // - old user + old repo + old repo owner = likely not to be fake

  // activity is a great indicator, for users as well as repositories
  // reactions can be taken into account (:thumbsup)

  let score = 0

  const userAge = getAge(pullRequest.author.createdAt)
  const userFollowers = pullRequest.author.followers.totalCount
  const repoAge = getAge(pullRequest.repository.createdAt)
  const repoStars = pullRequest.repository.stargazerCount
  const repoForks = pullRequest.repository.forkCount

  if (userAge > 365) score += 1
  if (userAge > 365 * 5) score += 2
  if (userAge > 365 * 10) score += 4

  if (userFollowers > 50) score += 1
  if (userFollowers > 250) score += 2
  if (userFollowers > 1000) score += 4

  if (repoAge > 90) score += 1
  if (repoAge > 365) score += 2
  if (repoAge > 365 * 5) score += 4

  if (repoStars > 50) score += 1
  if (repoStars > 250) score += 2
  if (repoStars > 1000) score += 4

  if (repoForks > 10) score += 1
  if (repoForks > 50) score += 2
  if (repoForks > 250) score += 4

  return Math.min(Math.round(Math.round((score / 35) * 100)), 100)
}

const validatePullRequest = (pullRequest, githubUser) => {
  const maxPrAge = Number(process.env.MAX_PULL_REQUEST_MERGE_AGE) || 30
  const repoOwner = pullRequest.repository.owner.login
  const mergeAge = getAge(pullRequest.mergedAt)

  if (repoOwner === githubUser) {
    return 1
  }

  if (mergeAge > maxPrAge) {
    return 2
  }

  if (pullRequest.score < 1) {
    return 3
  }

  return 0
}

module.exports = { getPullRequestScore, validatePullRequest }
