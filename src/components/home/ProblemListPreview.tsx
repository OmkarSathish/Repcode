import { CheckCircleIcon, SparklesIcon, BookOpenIcon } from "lucide-react"
import Badge from "../ui/Badge"

const ProblemListPreview = () => {
  // Sample data for the preview
  const problems = [
    { id: 1, name: "Two Sum", difficulty: "Easy", type: "Review" },
    { id: 2, name: "Valid Parentheses", difficulty: "Easy", type: "Learning" },
    { id: 3, name: "Merge Two Sorted Lists", difficulty: "Easy", type: "New" },
    { id: 4, name: "Maximum Subarray", difficulty: "Medium", type: "Review" },
    { id: 5, name: "LRU Cache", difficulty: "Medium", type: "Learning" },
    { id: 6, name: "Merge k Sorted Lists", difficulty: "Hard", type: "New" },
  ]

  return (
    <div className="p-6 overflow-hidden">
      <div className="py-5 border-b border-[#3A4253] flex justify-between items-center">
        <h2 className="text-lg font-semibold text-primary">Algorithm Problems</h2>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#2A303C] text-[#B0B7C3]">
          {problems.length} problems
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#3A4253]">
              <th className="text-left py-4 text-[#B0B7C3] font-medium text-sm">Problem Name</th>
              <th className="text-right py-4 text-[#B0B7C3] font-medium text-sm">Difficulty</th>
              <th className="text-right py-4 text-[#B0B7C3] font-medium text-sm">Type</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => (
              <tr key={problem.id} className="border-b border-[#3A4253] hover:bg-[#3A4253]/50 transition-colors">
                <td className="py-4">
                  <span className="font-medium text-primary hover:text-[#60a5fa] transition-colors cursor-pointer">
                    {problem.name}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <Badge type="difficulty" value={problem.difficulty} />
                </td>
                <td className="py-4 text-right">
                  <Badge type="problemType" value={problem.type} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProblemListPreview