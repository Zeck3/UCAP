import React from 'react';

// Student Object Structure
interface Student {
    id: string;
    name: string;
    scores: (number | undefined)[];
    finalScores: (number | '')[];
    finalCompGrades: (number | undefined)[];
}

// Defining Props
interface Props {
    students: Student[];
    handleScoreChange: (studentIndex: number, scoreIndex: number, value: string) => void;
    handleFinalScoreChange: (studentIndex: number, finalScoreIndex: number, value: string) => void;
    handleFinalCompGradeChange: (studentIndex: number, gradeIndex: number, value: string) => void;
}

const MidtermTable: React.FC<Props> = ({ students, handleScoreChange, handleFinalScoreChange, handleFinalCompGradeChange }) => {
    const columnGroups: string[][] = [
        [''],
        ['Assign 1', 'Assign 2', 'Assign 3', 'Seat Work 1', 'Seat Work 2', 'Total Score (SRC)', 'CPA'],
        ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4', 'Prelim', 'Total Score (SRC)', 'QA'],
        ['Mid Written Exam', 'M'],
        ['PIT1', 'PIT2', 'Total Score (SRC)', 'PIT%'],
        ['MGA', 'Mid Lec Grade Point'],
        ['Laboratory 1', 'Laboratory 2', 'Laboratory 3', 'Laboratory 4', 'Laboratory 5', 'Total Score (SRC)', 'Average'],
        ['Problem Set 1', 'Problem Set 2', 'Problem Set 3', 'Total Score (SRC)', 'Average'],
        ['Mid Lab Exam', 'M'],
        ['MGA', 'Mid Lab Grade Point'],
        ['Mid Grade Point', 'Midterm Grade'],
    ];

    const finalColumnGroups: string[][] = [
        ['Assign 4', 'Assign 5', 'Seat Work 3', 'Seat Work 4', 'Seat Work 5', 'Total Score (SRC)', 'CPA'],
        ['Quiz 5', 'Quiz 6', 'Quiz 7', 'Quiz 8', 'Pre-Final', 'Total Score (SRC)', 'QA'],
        ['Fin Written Exam', 'F'],
        ['PIT1', 'PIT2', 'Total Score (SRC)', 'PIT%'],
        ['FGA', 'Fin Lec Grade Point'],
        ['Report 2', 'Laboratory 6', 'Laboratory 7', 'Laboratory 8', 'Laboratory 9', 'Total Score (SRC)', 'Average'],
        ['Problem Set 4', 'Problem Set 5', 'Problem Set 6', 'Total Score (SRC)', 'Average'],
        ['Final Lab Exam', 'F'],
        ['FGA', 'Fin Lab Grade Point'],
        ['Fin Grade Point', 'Final Period Grade'],
    ];

    const finalCompGrades: string[][] = [
        [
            '1/2 MTG + 1/2 FTG', '1/2 MTG + 1/2 FTG (For Removal)', '1/2 MTG + 1/2 FTG (After Removal)', 'Description',
            '1/3 MTG + 2/3 FTG', '1/3 MTG + 2/3 FTG (For Removal)', '1/3 MTG + 2/3 FTG (After Removal)', 'Description',
            'Remarks (INC, Withdrawn, DF, OD)',
        ]
    ];

    const groupedHeaders = [
        { title: '', count: columnGroups[0].length },
        { title: 'Class Standing Performance Items (10%)', count: columnGroups[1].length },
        { title: 'Quiz/Prelim Performance Items (40%)', count: columnGroups[2].length },
        { title: 'Midterm Exam (30%)', count: columnGroups[3].length },
        { title: 'Per Inno Task (20%)', count: columnGroups[4].length },
        { title: 'Lecture', count: columnGroups[5].length },
        { title: 'Lab Exercises/Reports (30%)', count: columnGroups[6].length },
        { title: 'Hands-On Exercises (30%)', count: columnGroups[7].length },
        { title: 'Lab Major Exam (40%)', count: columnGroups[8].length },
        { title: 'Laboratory', count: columnGroups[9].length },
        { title: ' ', count: columnGroups[10].length },
    ];

    const finalGroupedHeaders = [
        { title: 'Class Standing Performance Items (10%)', count: finalColumnGroups[0].length },
        { title: 'Quiz/Pre-Final Performance Items (40%)', count: finalColumnGroups[1].length },
        { title: 'Final Exam (30%)', count: finalColumnGroups[2].length },
        { title: 'Per Inno Task (20%)', count: finalColumnGroups[3].length },
        { title: 'Lecture', count: finalColumnGroups[4].length },
        { title: 'Lab Exercises/Reports (30%)', count: finalColumnGroups[5].length },
        { title: 'Hands-On Exercises (30%)', count: finalColumnGroups[6].length },
        { title: 'Lab Major Exam (40%)', count: finalColumnGroups[7].length },
        { title: 'Laboratory', count: finalColumnGroups[8].length },
        { title: ' ', count: finalColumnGroups[9].length },
    ];

    const flatHeaders = columnGroups.flat();
    const lectureCount = columnGroups.slice(1, 6).reduce((acc, curr) => acc + curr.length, 0);
    const labCount = columnGroups.slice(6, 10).reduce((acc, curr) => acc + curr.length, 0);
    const midtermCount = columnGroups[10].length;
    const finCompGrades = finalCompGrades.flat();

    const finalFlatHeaders = finalColumnGroups.flat();
    const finalLectureCount = finalColumnGroups.slice(0, 5).reduce((acc, curr) => acc + curr.length, 0);
    const finalLabCount = finalColumnGroups.slice(5, 9).reduce((acc, curr) => acc + curr.length, 0);
    const finalTermCount = finalColumnGroups[9].length;

    const [scoreHeaders, setScoreHeaders] = React.useState<(number | '')[]>(Array(flatHeaders.length).fill(''));
    const [finalScoreHeaders, setFinalScoreHeaders] = React.useState<(number | '')[]>(Array(finalFlatHeaders.length).fill(''));
    const [finalCompGradeHeaders, setFinalCompGradeHeaders] = React.useState<(number | string)[]>(Array(finCompGrades.length).fill(''));

    const handleHeaderInputChange = (index: number, value: string) => {
        const updated = [...scoreHeaders];
        updated[index] = value === '' ? '' : Number(value);
        setScoreHeaders(updated);
    };

    const handleFinalHeaderInputChange = (index: number, value: string) => {
        const updated = [...finalScoreHeaders];
        updated[index] = value === '' ? '' : Number(value);
        setFinalScoreHeaders(updated);
    };

    const handleFinalCompGradeHeaderChange = (index: number, value: string) => {
        const updated = [...finalCompGradeHeaders];
        updated[index] = value;
        setFinalCompGradeHeaders(updated);
    };

    const csStart = columnGroups[0].length;
    const csTotalIndex = csStart + 5;

    const quizStart = csStart + columnGroups[1].length;
    const quizTotalIndex = quizStart + 5;

    const midtermExamStart = quizStart + columnGroups[2].length;
    const midtermMIndex = midtermExamStart + 1;

    const pitStart = midtermExamStart + columnGroups[3].length;
    const pitTotalIndex = pitStart + 2;
    const pitPercentIndex = pitStart + 3;

    return (
        <div className="overflow-x-auto border border-gray-300 w-full">
            <table className="min-w-max table-auto text-sm border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th colSpan={3} rowSpan={5} className="border border-gray-300 px-2 py-1 bg-white text-xs text-left">
                            <strong>Department: </strong>Department<br />
                            <strong>Subject: </strong>Subject<br />
                            <strong>Schedule: </strong>Schedule<br />
                            <strong>Year and Section: </strong>Year and Section
                        </th>
                        <th className="px-2 py-1 bg-dark-blue table-cell-default"></th>
                        <th colSpan={flatHeaders.length - 1} className="border border-gray-300 px-2 py-1 table-cell-default bg-light-blue">Midterm Grade</th>
                        <th colSpan={finalFlatHeaders.length} className="border border-gray-300 border-l-[30px] border-l-[#1F3864] px-2 py-1 table-cell-default bg-light-blue">Final Grade</th>
                        <th colSpan={finCompGrades.length} rowSpan={3} className="border border-gray-300 border-l-[30px] border-l-[#1F3864] px-2 py-1 table-cell-default bg-green text-white text-base">Computed Final Grade</th>
                    </tr>

                    <tr className="bg-ucap-yellow">
                        <th className="px-2 py-1 bg-dark-blue table-cell-default"></th>

                        {/* Midterm Grade Section*/}
                        <th colSpan={lectureCount} className="border border-gray-300 px-2 py-1 table-cell-default">Lecture (67%)</th>
                        <th colSpan={labCount} className="border border-gray-300 px-2 py-1 table-cell-default">Laboratory (33%)</th>
                        <th colSpan={midtermCount} className="border border-gray-300 px-2 py-1 table-cell-default">Midterm</th>

                        {/* Final Grade Section*/}
                        <th colSpan={finalLectureCount} className="border border-gray-300 border-l-[30px] border-l-[#1F3864] px-2 py-1 table-cell-default">Lecture (67%)</th>
                        <th colSpan={finalLabCount} className="border border-gray-300 px-2 py-1 table-cell-default">Laboratory (33%)</th>
                        <th colSpan={finalTermCount} className="border border-gray-300 px-2 py-1 table-cell-default">Final</th>
                    </tr>

                    <tr className="bg-bright-yellow">
                        {/* Midterm Grade Section*/}
                        {groupedHeaders.map((group, index) => (
                            <th key={index} colSpan={group.count} className={`table-cell-default ${group.title === '' ? 'bg-dark-blue' : 'border border-gray-300'}`}>
                                {group.title}
                            </th>
                        ))}

                        {/* Final Grade Section*/}
                        {finalGroupedHeaders.map((group, index) => (
                            <th
                                key={`final-${index}`}
                                colSpan={group.count}
                                className={`table-cell-default border border-gray-300 ${index === 0 ? 'border-l-[30px] border-l-[#1F3864]' : ''
                                    }`}>
                                {group.title}
                            </th>
                        ))}

                    </tr>

                    <tr className="bg-white">
                        {/* Midterm Grade Section*/}
                        {flatHeaders.map((label, index) => (
                            <th
                                key={index}
                                className={`table-cell-default ${label === '' ? 'bg-dark-blue' : 'border border-gray-300'} 
                                    ${index === 0 ? '' : 'transform rotate-270'} 
                                    ${["CPA", "QA", "M", "PIT%", "MGA", "Mid Lec Grade Point", "Average", "Mid Lab Grade Point", "Mid Grade Point", "Midterm Grade"].includes(label) ? 'font-bold' : 'font-normal'} 
                                    h-50 whitespace-nowrap`}>
                                {label}
                            </th>
                        ))}

                        {/* Final Grade Section*/}
                        {finalFlatHeaders.map((label, index) => (
                            <th
                                key={`final-${index}`}
                                className={`table-cell-default border border-gray-300 transform rotate-270
                                    ${index === 0 ? 'border-l-[30px] border-l-[#1F3864]' : ''}
                                    ${["CPA", "QA", "F", "PIT%", "FGA", "Fin Lec Grade Point", "Average", "Fin Lab Grade Point", "Fin Grade Point", "Final Period Grade"].includes(label) ? 'font-bold' : 'font-normal'} 
                                    h-50 whitespace-nowrap`}>
                                {label}
                            </th>
                        ))}

                        {/* Final Computed Grades Section*/}
                        {finCompGrades.map((label, index) => (
                            <th
                                key={`final-comp-${index}`}
                                rowSpan={2}
                                className={`table-cell-default border border-gray-300 transform
                                    ${index === 0 ? 'border-l-[30px] border-l-[#1F3864]' : ''}
                                    h-50 whitespace-nowrap font-normal`}>
                                {label}
                            </th>
                        ))}
                    </tr>

                    <tr>
                        {flatHeaders.map((_, index) => (
                            <td key={index} className={`table-cell-default h-10 ${index === 0 ? 'bg-dark-blue' : 'bg-white border border-gray-300'}`}></td>
                        ))}
                        {finalFlatHeaders.map((_, index) => (
                            <td
                                key={`final-${index}`}
                                className={`table-cell-default h-10 bg-white border border-gray-300 ${index === 0 ? 'border-l-[30px] border-l-[#1F3864]' : ''
                                    }`}
                            ></td>
                        ))}
                    </tr>

                    <tr>
                        <td colSpan={flatHeaders.length + finalFlatHeaders.length + finCompGrades.length + 3} className="bg-dark-blue h-10"></td>
                    </tr>

                    {/* Header Scores and Calculations */}
                    <tr className="bg-white">
                        <th className="border border-gray-300 table-cell-default">No.</th>
                        <th className="border border-gray-300 table-cell-default">Student ID</th>
                        <th className="border border-gray-300 table-cell-default">Name</th>
                        <th className="bg-dark-blue table-cell-default"></th>
                        {flatHeaders.slice(1).map((_, index) => {
                            const actualIndex = index + 1;
                            // Sum Calculations
                            const csSum = scoreHeaders.slice(csStart, csStart + 5).reduce((sum: number, val) => sum + (Number(val) || 0), 0);
                            const quizSum = scoreHeaders.slice(quizStart, quizStart + 5).reduce((sum: number, val) => sum + (Number(val) || 0), 0);
                            const pitSum = scoreHeaders.slice(pitStart, pitStart + 2).reduce((sum: number, val) => sum + (Number(val) || 0), 0);
                            const midtermMax = Number(scoreHeaders[midtermExamStart]) || 0;

                            const labStart = columnGroups.slice(0, 6).reduce((acc, curr) => acc + curr.length, 0);
                            const labTotalIndex = labStart + 5;

                            //@ts-ignore
                            const labSum = scoreHeaders.slice(labStart, labStart + 5).reduce((sum, val) => sum + (Number(val) || 0), 0);

                            const probSetStart = columnGroups.slice(0, 7).reduce((acc, curr) => acc + curr.length, 0);
                            const probSetTotalIndex = probSetStart + 3;

                            //@ts-ignore
                            const probSetSum = scoreHeaders.slice(probSetStart, probSetStart + 3).reduce((sum, val) => sum + (Number(val) || 0), 0);
                            //@ts-ignore
                            const probSetMax = scoreHeaders.slice(probSetStart, probSetStart + 3).reduce((sum, val) => sum + (Number(val) || 0), 0);
                            //@ts-ignore
                            const probSetAverage = probSetMax > 0 ? Math.round((probSetSum / probSetMax) * 100) : 0;

                            // Percentage Calculations
                            const cpaRatio = csSum > 0 ? csSum / csSum : 0;
                            const qaRatio = quizSum > 0 ? quizSum / quizSum : 0;
                            const mRatio = midtermMax > 0 ? midtermMax / midtermMax : 0;
                            const pitRatio = pitSum > 0 ? pitSum / pitSum : 0;

                            const mgaRaw = (cpaRatio * 0.1 + qaRatio * 0.4 + mRatio * 0.3 + pitRatio * 0.2) * 100;
                            const mga = Math.round(mgaRaw);

                            const mgaIndex = pitPercentIndex + 1;
                            const mgaRatio = mga / 100;
                            const midLecGradePoint = parseFloat(
                                (mgaRatio >= 0.7
                                    ? (23 / 3) - ((20 / 3) * mgaRatio)
                                    : 5 - ((20 / 7) * mgaRatio)
                                ).toFixed(3)
                            );

                            const labAverageIndex = labTotalIndex + 1;
                            const labAverage = typeof labSum === 'number' && labSum > 0 ? Math.round((labSum / labSum) * 100) : 0;

                            const handsOnAverage = probSetAverage;

                            const midLabExamIndex = columnGroups.slice(0, 8).reduce((acc, curr) => acc + curr.length, 0);
                            const midLabExamScore = Number(scoreHeaders[midLabExamIndex]) || 0;
                            const midLabExamMax = Number(scoreHeaders[midLabExamIndex]) || 0;
                            const midLabExamPercentage = midLabExamMax > 0 ? Math.round((midLabExamScore / midLabExamMax) * 100) : 0;

                            const labMGA = Math.round((labAverage * 0.3) + (handsOnAverage * 0.3) + (midLabExamPercentage * 0.4));
                            const labMGARatio = labMGA / 100;

                            const midLabGradePoint = parseFloat(
                                (labMGARatio >= 0.7
                                    ? (23 / 3) - ((20 / 3) * labMGARatio)
                                    : 5 - ((20 / 7) * labMGARatio)
                                ).toFixed(3)
                            );

                            const midGradePoint = parseFloat(
                                ((midLecGradePoint * 0.67) + (midLabGradePoint * 0.33)).toFixed(3)
                            );

                            function getClosestGrade(value: number): number {
                                const validGrades: number[] = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0];
                                return validGrades.reduce((prev: number, curr: number) =>
                                    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
                                );
                            }
                            const midtermGrade = getClosestGrade(midGradePoint);

                            if (actualIndex === csTotalIndex)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{csSum}</th>);
                            if (actualIndex === csTotalIndex + 1)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{Math.round(cpaRatio * 100)}%</th>);
                            if (actualIndex === quizTotalIndex)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{quizSum}</th>);
                            if (actualIndex === quizTotalIndex + 1)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{Math.round(qaRatio * 100)}%</th>);
                            if (actualIndex === midtermMIndex)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{Math.round(mRatio * 100)}%</th>);
                            if (actualIndex === pitTotalIndex)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{pitSum}</th>);
                            if (actualIndex === pitPercentIndex)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{Math.round(pitRatio * 100)}%</th>);
                            if (actualIndex === labTotalIndex)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{labSum}</th>);
                            if (actualIndex === labAverageIndex)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{labAverage}%</th>);
                            if (actualIndex === probSetTotalIndex)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{probSetSum}</th>);
                            if (actualIndex === probSetTotalIndex + 1)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{probSetAverage}%</th>);
                            if (actualIndex === mgaIndex)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{mga}%</th>);
                            if (actualIndex === mgaIndex + 1)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{midLecGradePoint.toFixed(3)}</th>);
                            if (actualIndex === midLabExamIndex + 1)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{midLabExamPercentage}%</th>);
                            if (actualIndex === midLabExamIndex + 2)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{labMGA}%</th>);
                            if (actualIndex === midLabExamIndex + 3)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{midLabGradePoint.toFixed(3)}</th>);
                            if (actualIndex === midLabExamIndex + 4)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{midGradePoint.toFixed(3)}</th>);
                            if (actualIndex === midLabExamIndex + 5)
                                return (<td key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{midtermGrade.toFixed(2)}</td>);

                            return (
                                <th key={index} className="border border-gray-300 table-cell-default">
                                    <input
                                        type="number"
                                        value={scoreHeaders[actualIndex] ?? ''}
                                        onChange={(e) => handleHeaderInputChange(actualIndex, e.target.value)}
                                        onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                                        className="w-16 text-center outline-none"
                                    />
                                </th>
                            );
                        })}

                        {finalFlatHeaders.map((_, index) => {
                            const actualIndex = index;

                            // Final Sum Calculations
                            const finalCsSum = finalScoreHeaders.slice(0, 5).reduce((sum: number, val) => sum + (Number(val) || 0), 0);
                            const finalQuizSum = finalScoreHeaders.slice(7, 12).reduce((sum: number, val) => sum + (Number(val) || 0), 0);
                            const finalPitSum = finalScoreHeaders.slice(16, 18).reduce((sum: number, val) => sum + (Number(val) || 0), 0);
                            const finalMax = Number(finalScoreHeaders[14]) || 0;
                            const finalLabSum = finalScoreHeaders.slice(22, 27).reduce((sum: number, val) => sum + (Number(val) || 0), 0);
                            const finalProbSetSum = finalScoreHeaders.slice(29, 32).reduce((sum: number, val) => sum + (Number(val) || 0), 0);
                            const finalProbSetMax = finalScoreHeaders.slice(29, 32).reduce((sum: number, val) => sum + (Number(val) || 0), 0);
                            const finalLabExamScore = Number(finalScoreHeaders[34]) || 0;
                            const finalLabExamMax = Number(finalScoreHeaders[34]) || 0;
                            const finalLabExamPercentage = finalLabExamMax > 0 ? Math.round((Number(finalLabExamScore) / Number(finalLabExamMax)) * 100) : 0;

                            // Final Percentage Calculations
                            const finalCpaRatio = finalCsSum > 0 ? finalCsSum / finalCsSum : 0;
                            const finalQaRatio = finalQuizSum > 0 ? finalQuizSum / finalQuizSum : 0;
                            const finalFRatio = finalMax > 0 ? finalMax / finalMax : 0;
                            const finalPitRatio = finalPitSum > 0 ? finalPitSum / finalPitSum : 0;

                            // Average Calculations
                            const finalLabAverage = typeof finalLabSum === 'number' && finalLabSum > 0 ? Math.round((finalLabSum / finalLabSum) * 100) : 0;
                            const finalHandsOnAverage = finalProbSetMax > 0 ? Math.round((finalProbSetSum / finalProbSetMax) * 100) : 0;

                            // FGA Calculations
                            const fgaRaw = (finalCpaRatio * 0.1 + finalQaRatio * 0.4 + finalFRatio * 0.3 + finalPitRatio * 0.2) * 100;
                            const fga = Math.round(fgaRaw);
                            const fgaRatio = fga / 100;
                            const finalLabMGA = Math.round((finalLabAverage * 0.3) + (finalHandsOnAverage * 0.3) + (finalLabExamPercentage * 0.4));
                            const finalLabMGARatio = finalLabMGA / 100;

                            const finLecGradePoint = parseFloat(
                                (fgaRatio >= 0.7
                                    ? (23 / 3) - ((20 / 3) * fgaRatio)
                                    : 5 - ((20 / 7) * fgaRatio)
                                ).toFixed(3)
                            );

                            const finLabGradePoint = parseFloat(
                                (finalLabMGARatio >= 0.7
                                    ? (23 / 3) - ((20 / 3) * finalLabMGARatio)
                                    : 5 - ((20 / 7) * finalLabMGARatio)
                                ).toFixed(3)
                            );

                            // Final Grade Calculations
                            const finGradePoint = parseFloat(
                                ((finLecGradePoint * 0.67) + (finLabGradePoint * 0.33)).toFixed(3)
                            );

                            function getClosestGrade(value: number): number {
                                const validGrades: number[] = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0];
                                return validGrades.reduce((prev: number, curr: number) =>
                                    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
                                );
                            }
                            const finalGrade = getClosestGrade(finGradePoint);

                            if (actualIndex === 5)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finalCsSum}</th>);
                            if (actualIndex === 6)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{Math.round(finalCpaRatio * 100)}%</th>);
                            if (actualIndex === 12)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finalQuizSum}</th>);
                            if (actualIndex === 13)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{Math.round(finalQaRatio * 100)}%</th>);
                            if (actualIndex === 15)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{Math.round(finalFRatio * 100)}%</th>);
                            if (actualIndex === 18)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finalPitSum}</th>);
                            if (actualIndex === 19)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{Math.round(finalPitRatio * 100)}%</th>);
                            if (actualIndex === 20)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{fga}%</th>);
                            if (actualIndex === 21)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finLecGradePoint.toFixed(3)}</th>);
                            if (actualIndex === 27)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finalLabSum}</th>);
                            if (actualIndex === 28)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finalLabAverage}%</th>);
                            if (actualIndex === 32)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finalProbSetSum}</th>);
                            if (actualIndex === 33)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finalHandsOnAverage}%</th>);
                            if (actualIndex === 35)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finalLabExamPercentage}%</th>);
                            if (actualIndex === 36)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finalLabMGA}%</th>);
                            if (actualIndex === 37)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finLabGradePoint.toFixed(3)}</th>);
                            if (actualIndex === 38)
                                return (<th key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finGradePoint.toFixed(3)}</th>);
                            if (actualIndex === 39)
                                return (<td key={index} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finalGrade.toFixed(2)}</td>);

                            return (
                                <th
                                    key={index}
                                    className={`border border-gray-300 table-cell-default ${index === 0 ? 'border-l-[30px] border-l-[#1F3864]' : ''
                                        }`}>
                                    <input
                                        type="number"
                                        value={finalScoreHeaders[actualIndex] ?? ''}
                                        onChange={(e) => handleFinalHeaderInputChange(actualIndex, e.target.value)}
                                        onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                                        className="w-16 text-center outline-none" />
                                </th>

                            );
                        })}
                        {finCompGrades.map((_, index) => {
                            if (index === 0) {
                                return (
                                    <th
                                        key={`final-comp-header-${index}`}
                                        className={`border border-gray-300 table-cell-default ${index === 0 ? 'border-l-[30px] border-l-[#1F3864]' : ''}`}
                                    >
                                        1.00
                                    </th>
                                );
                            }
                            if (index === 4) {
                                return (
                                    <th
                                        key={`final-comp-header-${index}`}
                                        className={`border border-gray-300 table-cell-default`}
                                    >
                                        1.00
                                    </th>
                                );
                            }
                            return (
                                <th
                                    key={`final-comp-header-${index}`}
                                    className={`border border-gray-300 table-cell-default ${index === 0 ? 'border-l-[30px] border-l-[#1F3864]' : ''}`}
                                >
                                    <input
                                        type="text"
                                        value={finalCompGradeHeaders[index] ?? ''}
                                        onChange={(e) => handleFinalCompGradeHeaderChange(index, e.target.value)}
                                        className="w-24 text-center outline-none"
                                    />
                                </th>
                            );
                        })}
                    </tr>
                </thead>

                <tbody>
                    {students.map((student, studentIndex) => {
                        const csSum = student.scores.slice(csStart, csStart + 5).reduce((sum, val) => (sum || 0) + (val || 0), 0);

                        //@ts-ignore
                        const csMax = scoreHeaders.slice(csStart, csStart + 5).reduce((sum, val) => sum + (Number(val) || 0), 0);
                        const cpaRatio = Number(csMax) > 0 ? (Number(csSum) || 0) / Number(csMax) : 0;

                        const quizSum = student.scores.slice(quizStart, quizStart + 5).reduce((sum, val) => (sum || 0) + (val || 0), 0);

                        //@ts-ignore
                        const quizMax = scoreHeaders.slice(quizStart, quizStart + 5).reduce((sum, val) => sum + (Number(val) || 0), 0);
                        //@ts-ignore
                        const qaRatio = quizMax > 0 ? quizSum / quizMax : 0;

                        const midtermScore = student.scores[midtermExamStart] ?? 0;
                        const midtermMax = Number(scoreHeaders[midtermExamStart]) || 0;
                        const mRatio = midtermMax > 0 ? midtermScore / midtermMax : 0;

                        const pitScoreSum = student.scores.slice(pitStart, pitStart + 2).reduce((sum, val) => (sum || 0) + (val || 0), 0);

                        //@ts-ignore
                        const pitMax = scoreHeaders.slice(pitStart, pitStart + 2).reduce((sum, val) => sum + (Number(val) || 0), 0);
                        //@ts-ignore
                        const pitRatio = pitMax > 0 ? pitScoreSum / pitMax : 0;

                        const labStart = columnGroups.slice(0, 6).reduce((acc, curr) => acc + curr.length, 0);
                        const labTotalIndex = labStart + 5;
                        const labSum = student.scores.slice(labStart, labStart + 5).reduce((sum, val) => (sum || 0) + (val || 0), 0);

                        //@ts-ignore
                        const labMax = scoreHeaders.slice(labStart, labStart + 5).reduce((sum, val) => sum + (Number(val) || 0), 0);
                        //@ts-ignore
                        const labAverage = labMax > 0 ? Math.round((labSum / labMax) * 100) : 0;

                        const probSetStart = columnGroups.slice(0, 7).reduce((acc, curr) => acc + curr.length, 0);
                        const probSetTotalIndex = probSetStart + 3;
                        const probSetSum = student.scores.slice(probSetStart, probSetStart + 3).reduce((sum, val) => (sum || 0) + (val || 0), 0);

                        //@ts-ignore
                        const probSetMax = scoreHeaders.slice(probSetStart, probSetStart + 3).reduce((sum, val) => sum + (Number(val) || 0), 0);
                        //@ts-ignore
                        const probSetAverage = probSetMax > 0 ? Math.round((probSetSum / probSetMax) * 100) : 0;

                        const midLabExamIndex = columnGroups.slice(0, 8).reduce((acc, curr) => acc + curr.length, 0);
                        const midLabExamScore = student.scores[midLabExamIndex] ?? 0;
                        const midLabExamMax = Number(scoreHeaders[midLabExamIndex]) || 0;
                        const midLabExamPercentage = midLabExamMax > 0 ? Math.round((midLabExamScore / midLabExamMax) * 100) : 0;

                        // Final percentage values
                        const cpa = Math.round(cpaRatio * 100);
                        const qa = Math.round(qaRatio * 100);
                        const m = Math.round(mRatio * 100);
                        const pitPercent = Math.round(pitRatio * 100);

                        // MGA calculated with full precision
                        const mgaRaw = (cpaRatio * 0.1 + qaRatio * 0.4 + mRatio * 0.3 + pitRatio * 0.2) * 100;
                        const mga = mgaRaw;

                        const mgaIndex = pitPercentIndex + 1;
                        const mgaMax = Number(scoreHeaders[mgaIndex]) || 100;
                        const mgaRatio = mga / mgaMax;

                        const midLecGradePoint = parseFloat(
                            (mgaRatio >= 0.7
                                ? (23 / 3) - ((20 / 3) * mgaRatio)
                                : 5 - ((20 / 7) * mgaRatio)
                            ).toFixed(3))

                        // Laboratory MGA calculation
                        const rawLabAverage = Number(labMax) > 0 ? (Number(labSum || 0) / Number(labMax)) * 100 : 0;
                        const rawProbSetAverage = Number(probSetMax) > 0 ? (Number(probSetSum || 0) / Number(probSetMax)) * 100 : 0;
                        const rawMidLabExamPercentage = midLabExamMax > 0 ? (midLabExamScore / midLabExamMax) * 100 : 0;

                        const labMGA = (rawLabAverage * 0.3) + (rawProbSetAverage * 0.3) + (rawMidLabExamPercentage * 0.4);
                        const labMGARatio = labMGA / 100;

                        const midLabGradePoint = parseFloat(
                            (labMGARatio >= 0.7
                                ? (23 / 3) - ((20 / 3) * labMGARatio)
                                : 5 - ((20 / 7) * labMGARatio)
                            ).toFixed(3))

                        // Mid Grade Point calculation
                        const midGradePoint = parseFloat(
                            ((midLecGradePoint * 0.67) + (midLabGradePoint * 0.33)).toFixed(3)
                        );

                        function getClosestGrade(value: number): number {
                            const validGrades: number[] = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0];
                            return validGrades.reduce((prev: number, curr: number) =>
                                Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
                            );
                        }
                        const midtermGrade = getClosestGrade(midGradePoint);

                        // Final Sum Calculations
                        const finalCsSum = student.finalScores.slice(0, 5).reduce((sum, val) => (sum || 0) + (val || 0), 0);
                        const finalQuizSum = student.finalScores.slice(7, 12).reduce((sum, val) => (sum || 0) + (val || 0), 0);
                        const finalPitSum = student.finalScores.slice(16, 18).reduce((sum, val) => (sum || 0) + (val || 0), 0);
                        const finalLabSum = student.finalScores.slice(22, 27).reduce((sum, val) => (sum || 0) + (val || 0), 0);
                        const finalHandsOnSum = student.finalScores.slice(29, 32).reduce((sum, val) => (sum || 0) + (val || 0), 0);

                        // Final Percentage Calculations
                        const finalCsMax = finalScoreHeaders.slice(0, 5).reduce((sum: number, val) => sum + (Number(val) || 0), 0);
                        //@ts-ignore
                        const finalCpaRatio = finalCsMax > 0 ? finalCsSum / finalCsMax : 0;

                        const finalQuizMax = finalScoreHeaders.slice(7, 12).reduce((sum: number, val) => sum + (Number(val) || 0), 0);
                        //@ts-ignore
                        const finalQaRatio = finalQuizMax > 0 ? finalQuizSum / finalQuizMax : 0;

                        const finalLabLecExamScore = student.finalScores[14] ?? 0;
                        const finalLabLecExamMax = Number(finalScoreHeaders?.[14]) || 0;
                        //@ts-ignore
                        const finalFLecRatio = finalLabLecExamMax > 0 ? finalLabLecExamScore / finalLabLecExamMax : 0;

                        const finalPitMax = finalScoreHeaders.slice(16, 18).reduce((sum: number, val) => sum + (Number(val) || 0), 0);
                        //@ts-ignore
                        const finalPitRatio = finalPitMax > 0 ? finalPitSum / finalPitMax : 0;

                        const finalLabLabExamScore = student.finalScores[34] ?? 0;
                        const finalLabLabExamMax = Number(finalScoreHeaders?.[34]) || 0;
                        //@ts-ignore
                        const finalFLabRatio = finalLabLabExamMax > 0 ? finalLabLabExamScore / finalLabLabExamMax : 0;

                        // Final Average Calculations (keep decimals, no rounding)
                        const finalLabMax = finalScoreHeaders.slice(22, 27).reduce((sum: number, val) => sum + (Number(val) || 0), 0);
                        //@ts-ignore
                        const finalLabAverage = finalLabMax > 0 ? finalLabSum / finalLabMax : 0;

                        const finalHandsOnMax = finalScoreHeaders.slice(29, 32).reduce((sum: number, val) => sum + (Number(val) || 0), 0);
                        //@ts-ignore
                        const finalHandsOnAverage = finalHandsOnMax > 0 ? finalHandsOnSum / finalHandsOnMax : 0;

                        // FGA Calculations (ratios between 0 and 1)
                        const fgaLecRatio = finalCpaRatio * 0.1 + finalQaRatio * 0.4 + finalFLecRatio * 0.3 + finalPitRatio * 0.2;

                        const fgaLabRatio = finalLabAverage * 0.3 + finalHandsOnAverage * 0.3 + finalFLabRatio * 0.4;

                        // Grade Point Calculations
                        const finLecGradePoint = parseFloat(
                            (fgaLecRatio >= 0.7
                                ? (23 / 3) - ((20 / 3) * fgaLecRatio)
                                : 5 - ((20 / 7) * fgaLecRatio)
                            ).toFixed(3)
                        );

                        const finLabGradePoint = parseFloat(
                            (fgaLabRatio >= 0.7
                                ? (23 / 3) - ((20 / 3) * fgaLabRatio)
                                : 5 - ((20 / 7) * fgaLabRatio)
                            ).toFixed(3)
                        );

                        const finGradePoint = parseFloat(
                            ((finLecGradePoint * 0.67) + (finLabGradePoint * 0.33)).toFixed(3)
                        );

                        const finalGrade = getClosestGrade(finGradePoint);

                        return (
                            <tr key={studentIndex}>
                                <td className="border border-gray-300 table-cell-default">{studentIndex + 1}</td>
                                <td className="border border-gray-300 table-cell-default">{student.id}</td>
                                <td className="border border-gray-300 table-cell-default">{student.name}</td>
                                <td className="bg-dark-blue table-cell-default"></td>

                                {flatHeaders.slice(1).map((_, scoreIndex) => {
                                    const actualIndex = scoreIndex + 1;

                                    if (actualIndex === csTotalIndex)
                                        return <td key={actualIndex} className="border border-gray-300 font-bold bg-gray-100 table-cell-default">{csSum}</td>;
                                    if (actualIndex === csTotalIndex + 1)
                                        return <td key={actualIndex} className="border border-gray-300 font-bold bg-gray-100 table-cell-default">{cpa}%</td>;
                                    if (actualIndex === quizTotalIndex)
                                        return <td key={actualIndex} className="border border-gray-300 font-bold bg-gray-100 table-cell-default">{quizSum}</td>;
                                    if (actualIndex === quizTotalIndex + 1)
                                        return <td key={actualIndex} className="border border-gray-300 font-bold bg-gray-100 table-cell-default">{qa}%</td>;
                                    if (actualIndex === midtermMIndex)
                                        return <td key={actualIndex} className="border border-gray-300 font-bold bg-gray-100 table-cell-default">{m}%</td>;
                                    if (actualIndex === pitTotalIndex)
                                        return <td key={actualIndex} className="border border-gray-300 font-bold bg-gray-100 table-cell-default">{pitScoreSum}</td>;
                                    if (actualIndex === pitPercentIndex)
                                        return <td key={actualIndex} className="border border-gray-300 font-bold bg-gray-100 table-cell-default">{pitPercent}%</td>;
                                    if (actualIndex === labTotalIndex)
                                        return <td key={actualIndex} className="border border-gray-300 font-bold bg-gray-100 table-cell-default">{labSum}</td>;
                                    if (actualIndex === labTotalIndex + 1)
                                        return <td key={actualIndex} className="border border-gray-300 font-bold bg-gray-100 table-cell-default">{labAverage}%</td>;
                                    if (actualIndex === probSetTotalIndex)
                                        return <td key={actualIndex} className="border border-gray-300 font-bold bg-gray-100 table-cell-default">{probSetSum}</td>;
                                    if (actualIndex === probSetTotalIndex + 1)
                                        return <td key={actualIndex} className="border border-gray-300 font-bold bg-gray-100 table-cell-default">{probSetAverage}%</td>;
                                    if (actualIndex === midLabExamIndex + 1)
                                        return <td key={actualIndex} className="border border-gray-300 font-bold bg-gray-100 table-cell-default">{midLabExamPercentage}%</td>;
                                    if (actualIndex === midLabExamIndex + 2)
                                        return <td key={actualIndex} className="border border-gray-300 font-bold bg-gray-100 table-cell-default">{Math.round(labMGA)}%</td>;
                                    if (actualIndex === mgaIndex)
                                        return <td key={actualIndex} className="border border-gray-300 font-bold bg-gray-100 table-cell-default">{Math.round(mga)}%</td>;
                                    if (actualIndex === mgaIndex + 1)
                                        return <td key={actualIndex} className="border border-gray-300 font-bold bg-gray-100 table-cell-default">{midLecGradePoint.toFixed(3)}</td>;
                                    if (actualIndex === midLabExamIndex + 3)
                                        return <td key={actualIndex} className="border border-gray-300 font-bold bg-gray-100 table-cell-default">{midLabGradePoint.toFixed(3)}</td>;
                                    if (actualIndex === midLabExamIndex + 4)
                                        return <td key={actualIndex} className="border border-gray-300 font-bold bg-gray-100 table-cell-default">{midGradePoint.toFixed(3)}</td>;
                                    if (actualIndex === midLabExamIndex + 5)
                                        return <td key={actualIndex} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{midtermGrade.toFixed(2)}</td>;

                                    return (
                                        <td key={actualIndex} className="border border-gray-300 table-cell-default">
                                            <input
                                                type="number"
                                                value={student.scores[actualIndex] ?? ''}
                                                onChange={(e) => handleScoreChange(studentIndex, actualIndex, e.target.value)}
                                                onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                                                className="w-16 text-center outline-none"
                                            />
                                        </td>
                                    );
                                })}
                                {finalFlatHeaders.map((_, index) => {
                                    const actualIndex = index;

                                    if (actualIndex === 5)
                                        return (<th key={actualIndex} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finalCsSum}</th>);
                                    if (actualIndex === 12)
                                        return (<th key={actualIndex} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finalQuizSum}</th>);
                                    if (actualIndex === 18)
                                        return (<th key={actualIndex} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finalPitSum}</th>);
                                    if (actualIndex === 27)
                                        return (<th key={actualIndex} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finalLabSum}</th>);
                                    if (actualIndex === 32)
                                        return (<th key={actualIndex} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finalHandsOnSum}</th>);
                                    if (actualIndex === 6)
                                        return (<th key={actualIndex} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{Math.round(finalCpaRatio * 100)}%</th>);
                                    if (actualIndex === 13)
                                        return (<th key={actualIndex} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{Math.round(finalQaRatio * 100)}%</th>);
                                    if (actualIndex === 15)
                                        return (<th key={actualIndex} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{Math.round(finalFLecRatio * 100)}%</th>);
                                    if (actualIndex === 19)
                                        return (<th key={actualIndex} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{Math.round(finalPitRatio * 100)}%</th>);
                                    if (actualIndex === 28)
                                        return (<th key={actualIndex} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{Math.round(finalLabAverage * 100)}%</th>);
                                    if (actualIndex === 33)
                                        return (<th key={actualIndex} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{Math.round(finalHandsOnAverage * 100)}%</th>);
                                    if (actualIndex === 20)
                                        return (<th key={actualIndex} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{Math.round(fgaLecRatio * 100)}%</th>);
                                    if (actualIndex === 21)
                                        return (<th key={actualIndex} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finLecGradePoint.toFixed(3)}</th>);
                                    if (actualIndex === 35)
                                        return (<th key={actualIndex} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{Math.round(finalFLabRatio * 100)}%</th>);
                                    if (actualIndex === 36)
                                        return (<th key={actualIndex} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{Math.round(fgaLabRatio * 100)}%</th>);
                                    if (actualIndex === 37)
                                        return (<th key={actualIndex} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finLabGradePoint.toFixed(3)}</th>);
                                    if (actualIndex === 38)
                                        return (<th key={actualIndex} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finGradePoint.toFixed(3)}</th>);
                                    if (actualIndex === 39)
                                        return (<th key={actualIndex} className="border border-gray-300 bg-gray-100 font-bold table-cell-default">{finalGrade.toFixed(2)}</th>);

                                    return (
                                        <td
                                            key={`final-${studentIndex}-${index}`}
                                            className={`border border-gray-300 table-cell-default ${index === 0 ? 'border-l-[30px] border-l-[#1F3864]' : ''
                                                }`}>
                                            <input
                                                type="number"
                                                value={student.finalScores?.[actualIndex] ?? ''}
                                                onChange={(e) => handleFinalScoreChange(studentIndex, actualIndex, e.target.value)}
                                                onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                                                className="w-16 text-center outline-none" />
                                        </td>
                                    );

                                })}
                                {finCompGrades.map((_, index) => {
                                    if (index === 0) {
                                        const computedGrade = ((midtermGrade * 0.5) + (finalGrade * 0.5)).toFixed(2);
                                        return (
                                            <td
                                                key={`final-comp-${studentIndex}-${index}`}
                                                className={`border border-gray-300 table-cell-default ${index === 0 ? 'border-l-[30px] border-l-[#1F3864]' : ''}`}
                                            >
                                                {computedGrade}
                                            </td>
                                        );
                                    }
                                    if (index === 4) {
                                        const computedGrade = ((midtermGrade * 0.33) + (finalGrade * 0.67)).toFixed(2);
                                        return (
                                            <td
                                                key={`final-comp-${studentIndex}-${index}`}
                                                className={`border border-gray-300 table-cell-default`}
                                            >
                                                {computedGrade}
                                            </td>
                                        );
                                    }
                                    return (
                                        <td
                                            key={`final-comp-${studentIndex}-${index}`}
                                            className={`border border-gray-300 table-cell-default ${index === 0 ? 'border-l-[30px] border-l-[#1F3864]' : ''}`}
                                        >
                                            <input
                                                type="text"
                                                value={student.finalCompGrades?.[index] ?? ''}
                                                onChange={(e) => handleFinalCompGradeChange(studentIndex, index, e.target.value)}
                                                className="w-24 text-center outline-none"
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default MidtermTable;