const LoadingSpinner = () => {


    return (
        <div className="h-[100vh] w-[100vw] bg-primary flex flex-col justify-center items-center">
            <h1 className="text-white text-xl mb-4">Chargement des données...</h1>
            <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        </div>
    );
};

export default LoadingSpinner;