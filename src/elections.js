class Elections {
	constructor(list, withDistrict) {
		this.candidates = [];
		this.officialCandidates = [];
		this.votesWithoutDistricts = [];
		this.list = list;
		this.withDistrict = withDistrict;
		votesWithDistricts = {
			'District 1': [],
			'District 2': [],
			'District 3': [],
		};
	}

	addCandidate(candidate) {
		this.officialCandidates.push(candidate);
		this.candidates.push(candidate);
		this.votesWithoutDistricts.push(0);
		this.votesWithDistricts['District 1'].push(0);
		this.votesWithDistricts['District 2'].push(0);
		this.votesWithDistricts['District 3'].push(0);
	}

	voteFor(elector, candidate, electorDistrict) {
		if (!withDistrict) {
			if (this.candidates.includes(candidate)) {
				const index = candidates.indexOf(candidate);
				this.votesWithoutDistricts[index] += 1;
			} else {
				this.candidates.push(candidate);
				this.votesWithoutDistricts.push(1);
			}
		} else {
			if (electorDistrict in this.votesWithDistricts) {
				districtVotes = this.votesWithDistricts[electorDistrict];
				if (this.candidates.includes(candidate)) {
					const index = candidates.indexOf(candidate);
					this.districtVotes[index] += 1;
				} else {
					this.candidates.push(candidate);
					this.votesWithDistricts.forEach(districtVotes => {
						districtVotes.push(0);
					});
					this.districtVotes[this.candidates.length - 1] += 1;
				}
			}
		}
	}

	results() {}
}
