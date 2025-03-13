import Link from 'next/link';

const StatCard = ({
  title,
  value,
  icon: Icon,
  change,
  isPositive,
  linkTo,
  bgColor = 'bg-white',
  iconBgColor = 'bg-indigo-100',
  iconColor = 'text-indigo-600',
}) => {
  return (
    <div className={`rounded-lg shadow-md ${bgColor} overflow-hidden`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-full p-3 ${iconBgColor}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-xl font-semibold text-gray-900">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>

        {change !== undefined && (
          <div className="mt-4">
            <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <span className="font-medium">
                {isPositive ? '+' : ''}{change}%
              </span>
              <svg 
                className={`flex-shrink-0 ml-1 h-5 w-5 ${isPositive ? 'text-green-500' : 'text-red-500'}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                {isPositive ? (
                  <path 
                    fillRule="evenodd" 
                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" 
                    clipRule="evenodd"
                  />
                ) : (
                  <path 
                    fillRule="evenodd" 
                    d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" 
                    clipRule="evenodd"
                  />
                )}
              </svg>
              <span className="ml-1 text-gray-500">
                desde o mês passado
              </span>
            </div>
          </div>
        )}

        {linkTo && (
          <div className="mt-4">
            <Link href={linkTo} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Ver mais →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;