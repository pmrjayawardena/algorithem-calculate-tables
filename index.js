const fixedToTwoPlaces = (number) => Number(parseFloat(number).toFixed(1));

const removeSpace = (value) => {
	if (value) {
		return value.replace(/\s/g, '');
	} else {
		return value;
	}
};

const getTableValue = (tables, tableName, name, column) => {
	const allTables = {
		spotPackage: {
			rows: ['Number of spots per campaign package', 'Number of spots per hour', '30 sec', '15 sec'].map((item) => removeSpace(item)),
			columns: ['Light', 'Medium', 'Heavy', 'Total'],
		},

		distributionPackage: {
			rows: ['Distribution of campaign packages', 'Number of spot packs available', '30 sec spot packs', '15 sec spot packs'].map((item) => removeSpace(item)),
			columns: ['20', '50', '30', 'Total'],
		},

		audiencePackage: {
			rows: ['Audience Impacts per package', 'Weekly audience impacts generated based on volume of campaigns'].map((item) => removeSpace(item)),
			columns: ['Light', 'Medium', 'Heavy', 'Total'],
		},
	};
	const dataList = {};
	Object.keys(allTables).map((item) => {
		if (item == tableName) {
			const rowIndex = allTables[tableName].rows.indexOf(name);
			const colIndex = allTables[tableName].columns.indexOf(column);
			const foundTable = tables.find((item) => item[tableName]);

			const foundValue = foundTable[tableName][rowIndex][colIndex];
			dataList['value'] = foundValue;
		}
	});

	return dataList?.value;
};
const calculateInstoreValues = () => {
	const splitTable = [
		[50, 0, 0, 0],
		[50, 0, 0, 0],
	];

	const spotPackage = [
		[90, 120, 150, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
	];

	const distributionPackage = [
		[20, 50, 30, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
	];

	const audiencePackage = [
		[0, 0, 0],
		[0, 0, 0],
		[0, 0, 0],
	];

	for (let i = 0; i < splitTable.length; i++) {
		for (let j = 0; j <= splitTable[i].length; j++) {
			splitTable[i][1] = (15 * 2 * 30 * splitTable[i][0]) / 100;

			if (i == 0) {
				splitTable[i][2] = splitTable[i][1] / 15;
			} else {
				splitTable[i][2] = splitTable[i][1] / 30;
			}
		}
	}

	const totalSpotHours = splitTable
		.map((value) => value[2])
		.reduce(function (accumulator, currentValue) {
			return accumulator + currentValue;
		}, 0);

	for (let i = 0; i < splitTable.length; i++) {
		for (let j = 0; j <= splitTable[i].length; j++) {
			splitTable[i][3] = Math.round((splitTable[i][2] / totalSpotHours) * 100);
		}
	}

	for (let i = 0; i < spotPackage.length; i++) {
		for (let j = 0; j <= spotPackage[i].length; j++) {
			spotPackage[1][i] = spotPackage[0][i] / 60;
			const calc = fixedToTwoPlaces((spotPackage[1][i] * splitTable[1][3]) / 100);
			spotPackage[2][i] = calc;
			spotPackage[3][i] = fixedToTwoPlaces((spotPackage[1][i] * splitTable[0][3]) / 100);
		}
	}

	const spotTableSum = spotPackage.map((r) => r.reduce((a, b) => a + b));

	for (let i = 0; i < distributionPackage.length; i++) {
		for (let j = 0; j <= distributionPackage[i].length; j++) {
			distributionPackage[0][3] = totalSpotHours / spotTableSum[1];
			distributionPackage[1][i] = fixedToTwoPlaces((distributionPackage[0][i] / 100) * distributionPackage[0][3]);
			distributionPackage[2][i] = fixedToTwoPlaces((splitTable[1][3] / 100) * distributionPackage[1][i]);
			distributionPackage[3][i] = fixedToTwoPlaces((splitTable[0][3] / 100) * distributionPackage[1][i]);
		}
	}

	for (let i = 0; i < audiencePackage.length; i++) {
		for (let j = 0; j <= audiencePackage[i].length; j++) {
			audiencePackage[0][i] = Number(parseFloat(((((3500000 * 12) / 52) * 10) / 60) * spotPackage[1][i]).toFixed(0));

			audiencePackage[1][i] = Number(parseFloat(audiencePackage[0][i] * distributionPackage[1][i]).toFixed(0));
		}
	}

	const totalAudience = audiencePackage.map((r) => r.reduce((a, b) => a + b));
	const totalMonthlyAudienceImpact = (totalAudience[1] * 52) / 12;

	const tables = [{ splitTable }, { spotPackage }, { distributionPackage }, { audiencePackage }];

	const anyTimeTableOne = [
		[5, 2, 0, 0.3, 0, 4.31, 0, 0, 0, 0],
		[10, 1, 0, 0.3, 0, 4.31, 0, 0, 0, 0],
		[30, 1, 0, 1, 0, 14.37, 0, 0, 0, 0],
	];
	const anyTimeTableTwo = [[30, 150, 0, 1, 0, 12.93, 0, 0, 0, 0]];
	let spondershipTime = 'Monthly';
	let timePeriodSold = 'Monthly';
	for (let i = 0; i < anyTimeTableOne.length; i++) {
		for (let j = 0; j <= anyTimeTableOne[i].length; j++) {
			anyTimeTableOne[i][2] = 3 * anyTimeTableOne[i][0] * anyTimeTableOne[i][1];
			anyTimeTableOne[i][4] = anyTimeTableOne[i][3] * anyTimeTableOne[i][1];
			anyTimeTableOne[i][6] = anyTimeTableOne[i][5] * anyTimeTableOne[i][1];
			anyTimeTableOne[i][7] = Math.round(
				anyTimeTableOne[i][6] *
					(3 * 60) *
					(spondershipTime == 'Weekly' ? 1 : spondershipTime == 'Fortnightly' ? 2 : spondershipTime == 'Monthly' ? 4 : spondershipTime == 'Quarterly' ? 12 : spondershipTime == 'Annual' ? 52 : 1)
			);
			anyTimeTableOne[i][8] = Math.round(anyTimeTableOne[i][1] * 3 * ((((3500000 * 12) / 52) * 10) / 60));
			anyTimeTableOne[i][9] =
				Math.round(
					anyTimeTableOne[i][8] *
						(timePeriodSold == 'Weekly' ? 52 / 52 : timePeriodSold == 'Fortnightly' ? 52 / 26 : timePeriodSold == 'Monthly' ? 52 / 12 : timePeriodSold == 'Quarterly' ? 52 / 4 : 0)
				) + 1;
		}
	}

	const sponsorshipValue = anyTimeTableOne
		.map((value) => value[7])
		.reduce(function (accumulator, currentValue) {
			return accumulator + currentValue;
		}, 0);

	const audienceTotal = anyTimeTableOne
		.map((value) => value[9])
		.reduce(function (accumulator, currentValue) {
			return accumulator + currentValue;
		}, 0);

	const timePeriod = 'Monthly';
	for (let i = 0; i < anyTimeTableTwo.length; i++) {
		for (let j = 0; j <= anyTimeTableTwo[i].length; j++) {
			anyTimeTableTwo[i][2] = anyTimeTableTwo[i][0] * getTableValue(tables, 'spotPackage', removeSpace('Number of spots per hour'), 'Heavy');
			anyTimeTableTwo[i][6] = Math.round(anyTimeTableTwo[i][1] * anyTimeTableTwo[i][5]);
			anyTimeTableTwo[i][7] = anyTimeTableTwo[i][6];
			anyTimeTableTwo[i][8] = Math.round(3500000 * ((getTableValue(tables, 'spotPackage', removeSpace('Number of spots per hour'), 'Heavy') * 12) / 52) * (10 / 60));
			anyTimeTableTwo[i][9] = Math.round(
				anyTimeTableTwo[i][8] * (timePeriod == 'Weekly' ? 52 / 52 : timePeriod == 'Fortnightly' ? 52 / 26 : timePeriod == 'Monthly' ? 52 / 12 : timePeriod == 'Quarterly' ? 52 / 4 : 0)
			);
		}
	}
	const tableOneTotalsecondsperhour = anyTimeTableOne
		.map((value) => value[2])
		.reduce(function (accumulator, currentValue) {
			return accumulator + currentValue;
		}, 0);
	const tableTwoTotalsecondsperhour = anyTimeTableTwo
		.map((value) => value[2])
		.reduce(function (accumulator, currentValue) {
			return accumulator + currentValue;
		}, 0);

	const TotalsecondsperSponsorperhour = tableTwoTotalsecondsperhour + tableOneTotalsecondsperhour;
	const totalSponsorshipValue = sponsorshipValue * (1 + 100);
	const costPerThousand = 39312 / (audienceTotal / 1000);

	let totalsecondsperSponsorpertimeperiod =
		TotalsecondsperSponsorperhour *
		60 *
		(spondershipTime == 'Weekly' ? 1 : spondershipTime == 'Fortnightly' ? 2 : spondershipTime == 'Monthly' ? 4 : spondershipTime == 'Quarterly' ? 12 : spondershipTime == 'Annual' ? 52 : 1);

	let TotalequivalentspotsperSponsorforthetimeperiod = (totalsecondsperSponsorpertimeperiod / 60) * 2;
	const costPerAverage = 39312 / TotalequivalentspotsperSponsorforthetimeperiod;
	console.table(costPerThousand);
	// console.table(spotPackage);
	// console.table(distributionPackage);
	// console.table(audiencePackage);
	// return getTableValue(tables, tableName, fieldName, columnName);
};

calculateInstoreValues();
