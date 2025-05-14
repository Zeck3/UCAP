import React from 'react';

// Student Object Structure
interface Student {
    id: string;
    name: string;
    scores: (number | undefined)[];
}

// Defining Props
interface Props {
    students: Student[];
    handleScoreChange: (studentIndex: number, scoreIndex: number, value: string) => void;
}

const MidtermTable: React.FC<Props> = ({ students, handleScoreChange }) => {
    const columnGroups: string[][] = [
        [''],
        ['Assign 1', 'Assign 2', 'Assign 3', 'SW 1', 'SW 2', 'Total', 'CPA'],
        ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4', 'Prelim', 'Total', 'QA'],
        ['Midterm Exam', 'M'],
        ['PIT1', 'PIT2', 'Total', 'PIT%'],
        ['MGA', 'Mid Lec Grade Point'],
        ['Lab 1', 'Lab 2', 'Lab 3', 'Lab 4', 'Lab 5', 'Total', 'Average'],
        ['Prob Set 1', 'Prob Set 2', 'Prob Set 3', 'Total', 'Average'],
        ['Mid Lab Exam', 'M'],
        ['MGA', 'Mid Lab Grade Point'],
        ['Mid Grade Point', 'Midterm Grade'],
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

    const flatHeaders = columnGroups.flat();
    const lectureCount = columnGroups.slice(1, 6).reduce((acc, curr) => acc + curr.length, 0);
    const labCount = columnGroups.slice(6, 10).reduce((acc, curr) => acc + curr.length, 0);
    const midtermCount = columnGroups[10].length;

    const [scoreHeaders, setScoreHeaders] = React.useState<(number | '')[]>(Array(flatHeaders.length).fill(''));

    const handleHeaderInputChange = (index: number, value: string) => {
        const updated = [...scoreHeaders];
        updated[index] = value === '' ? '' : Number(value);
        setScoreHeaders(updated);
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
                        <th colSpan={flatHeaders.length} className="border border-gray-300 px-2 py-1 table-cell-default bg-light-blue">Midterm Grade</th>
                    </tr>

                    <tr className="bg-ucap-yellow">
                        <th className="px-2 py-1 bg-dark-blue table-cell-default"></th>
                        <th colSpan={lectureCount} className="border border-gray-300 px-2 py-1 table-cell-default">Lecture (67%)</th>
                        <th colSpan={labCount} className="border border-gray-300 px-2 py-1 table-cell-default">Laboratory (33%)</th>
                        <th colSpan={midtermCount} className="border border-gray-300 px-2 py-1 table-cell-default">Midterm</th>
                    </tr>

                    <tr className="bg-bright-yellow">
                        {groupedHeaders.map((group, index) => (
                            <th key={index} colSpan={group.count} className={`table-cell-default ${group.title === '' ? 'bg-dark-blue' : 'border border-gray-300'}`}>
                                {group.title}
                            </th>
                        ))}
                    </tr>

                    <tr className="bg-white">
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
                    </tr>

                    <tr>
                        {flatHeaders.map((_, index) => (
                            <td key={index} className={`table-cell-default h-10 ${index === 0 ? 'bg-dark-blue' : 'bg-white border border-gray-300'}`}></td>
                        ))}
                    </tr>

                    <tr>
                        <td colSpan={flatHeaders.length + 3} className="bg-dark-blue h-10"></td>
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

                            //@ts-expect-error try ke
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

                            const midLabGradePoint = !isNaN(mgaRatio)
                                ? parseFloat(
                                    (mgaRatio >= 0.7
                                        ? (23 / 3) - ((20 / 3) * mgaRatio)
                                        : 5 - ((20 / 7) * mgaRatio)
                                    ).toFixed(3)
                                )
                                : 0.000;

                            const midGradePoint = parseFloat(
                                ((midLecGradePoint * 0.67) + (midLabGradePoint * 0.33)).toFixed(3)
                            );

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
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default MidtermTable;