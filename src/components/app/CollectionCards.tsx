import React, { useState, useEffect, useContext } from "react";
import CollectionModal from "./CollectionModal";
import { auth } from "../../firebaseConfig";
import { useRouter } from "next/router";
import { AuthContext } from "@/auth/AuthContext";
import Toast from "./Toast";
import { useQuery, useMutation, useQueryClient } from 'react-query'; 
import { formatDistanceToNow } from 'date-fns'; 

const CollectionCards = () => {
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleMenuId, setVisibleMenuId] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<any>(null);
  const [deletingCollections, setDeletingCollections] = useState<Set<number>>(new Set());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [collectionToEdit, setCollectionToEdit] = useState<any>(null);
  const { user } = useContext(AuthContext); 
  const queryClient = useQueryClient();

  const router = useRouter();

  // Add this effect to listen for the add-collection-button click
  useEffect(() => {
    const addButton = document.getElementById('add-collection-button');
    if (addButton) {
      const handleClick = () => setIsModalOpen(true);
      addButton.addEventListener('click', handleClick);
      return () => addButton.removeEventListener('click', handleClick);
    }
  }, []);

  const fetchCollections = async () => {
    if (!user) return null; 
    const response = await fetch(`/api/getUserCollections?userEmail=${user.email}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  };

  const { isLoading, data: collections = [], error } = useQuery(['collections', user?.email], fetchCollections, {
    enabled: !!user?.email,
  })

  const toggleMenu = (id: any) => {
    setVisibleMenuId(visibleMenuId === id ? null : id);
  };

  // Function to open the delete confirmation modal
  const openDeleteConfirmation = (collection: any) => {
    setCollectionToDelete(collection);
    setDeleteConfirmationOpen(true);
  };

  // Function to close the delete confirmation modal
  const closeDeleteConfirmation = () => {
    setDeleteConfirmationOpen(false);
    setCollectionToDelete(null);
  };

  const [isDeletingCollection, setIsDeletingCollection] = useState(false);

  const deleteCollectionMutation = useMutation(
    async (collectionId: any) => {
      setIsDeletingCollection(true);
      const token = await auth.currentUser?.getIdToken();
  
      if (!token) {
        throw new Error('Authentication token is not available.');
      }
  
      const response = await fetch(`/api/deleteCollection?collectionId=${collectionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) throw new Error('Problem deletion failed');
      return response.json();
    },
    {
      onSuccess: () => {
        setDeleteConfirmationOpen(false);
        
        queryClient.invalidateQueries(['collections', user?.email]);
        queryClient.invalidateQueries(['allProblems', user?.email]);
        queryClient.invalidateQueries(['userSettings', user?.email]);
        showToast(
          <>
            <span className="inline-block mr-2 bg-error rounded-full" style={{ width: '10px', height: '10px' }}></span>
            Collection deleted successfully
          </>
        );
      },
      onSettled: () => {
        setIsDeletingCollection(false);
      }
    }
  );

  const deleteCollection = () => {
    if (collectionToDelete) {
      setDeletingCollections((prev) => new Set(prev).add(collectionToDelete.id));
      deleteCollectionMutation.mutate(collectionToDelete.id);
    }
  }

  const openEditModal = (collection: any) => {
    setCollectionToEdit(collection);
    setIsEditModalOpen(true);
    setVisibleMenuId(null);
  };

  const showToast = (message: any) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000); // Hide after 3 seconds
  };

  const totalCollections = collections.length;
  const totalProblems = collections.reduce((acc: number, collection: any) => {
    return acc + collection.newCount + collection.learningCount + collection.reviewCount;
  }, 0);

  if (error) return <div>Error: {(error as Error).message}</div>;
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="relative flex flex-col items-center">
          {/* Outer glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] blur-xl opacity-20 animate-pulse"></div>
          
          {/* Spinner container */}
          <div className="relative">
            {/* Gradient ring */}
            <div className="w-16 h-16 rounded-full border-2 border-transparent 
                           bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] opacity-20"></div>
            
            {/* Spinning gradient arc */}
            <div className="absolute top-0 left-0 w-16 h-16 border-2 border-transparent 
                           rounded-full animate-spin duration-1000" 
                 style={{
                   borderTopColor: '#06b6d4',
                   borderRightColor: '#3b82f6',
                   animationDuration: '1s'
                 }}>
            </div>
            
            {/* Inner circle with logo or icon */}
            
          </div>
          
          {/* Loading text with shimmer effect */}
          <div className="mt-4 text-sm font-medium text-[#B0B7C3] relative overflow-hidden">
            <span>Loading</span>
            <span className="inline-flex overflow-hidden ml-1">
              <span className="animate-ellipsis">.</span>
              <span className="animate-ellipsis animation-delay-300">.</span>
              <span className="animate-ellipsis animation-delay-600">.</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-8 gap-y-8">
        {collections.map((collection: any) => (
          <div
            key={collection.id}
            className="bg-[#343B4A] rounded-xl overflow-hidden shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-[#3b82f6]/10 transition-all duration-300 border border-[#3A4253]"
          >
            <div className="p-6">
              <h3 className="font-semibold text-xl text-primary mb-2 truncate">
                {collection.title}
              </h3>
              <div className="flex items-center text-sm text-[#B0B7C3] mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Last updated: {collection.lastAdded ? formatDistanceToNow(new Date(collection.lastAdded), { addSuffix: true }) : 'N/A'}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full">
                <div className="flex w-full h-2 bg-feintwhite rounded-full overflow-hidden">
                  <div className="h-full bg-new rounded-l-full" style={{ 
                    width: `${(collection.newCount / Math.max(1, collection.newCount + collection.learningCount + collection.reviewCount)) * 100}%`,
                    display: collection.newCount > 0 ? 'block' : 'none'
                  }}></div>
                  <div className="h-full bg-learning" style={{ 
                    width: `${(collection.learningCount / Math.max(1, collection.newCount + collection.learningCount + collection.reviewCount)) * 100}%`,
                    display: collection.learningCount > 0 ? 'block' : 'none'
                  }}></div>
                  <div className="h-full bg-review rounded-r-full" style={{ 
                    width: `${(collection.reviewCount / Math.max(1, collection.newCount + collection.learningCount + collection.reviewCount)) * 100}%`,
                    display: collection.reviewCount > 0 ? 'block' : 'none'
                  }}></div>
                </div>
              </div>
              
              {/* Problem counts */}
              <div className="flex space-x-4 mt-2 text-sm text-[#B0B7C3]">
                <div className="flex items-center">
                  <span className="inline-block bg-new mr-1.5 rounded-full" style={{ width: '8px', height: '8px' }}></span>
                  <span>{collection.newCount}</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block bg-learning mr-1.5 rounded-full" style={{ width: '8px', height: '8px' }}></span>
                  <span>{collection.learningCount}</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block bg-review mr-1.5 rounded-full" style={{ width: '8px', height: '8px' }}></span>
                  <span>{collection.reviewCount}</span>
                </div>
              </div>
              
              <div className="flex justify-between mt-5">
                <button 
                  onClick={() => {
                    if (!deletingCollections.has(collection.id)) {
                      router.push(`/app/collections/${collection.id}`);
                    }
                  }}
                  className="flex items-center text-secondary hover:text-[#60a5fa] transition-colors"
                >
                  <span className="mr-1">View problems</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
                <div className="flex space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(collection);
                    }}
                    className="p-2 rounded-lg hover:bg-[#3F475A] text-[#8A94A6] hover:text-[#3b82f6] transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteConfirmation(collection);
                    }}
                    className="p-2 rounded-lg hover:bg-[#3F475A] text-[#8A94A6] hover:text-[#F87171] transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
  
      {/* Modal Components */}
      <CollectionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        isEditMode={true}
        collectionToEdit={collectionToEdit}
        showToast={showToast}
      />
      <CollectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        showToast={showToast}
      />
  
      {/* Delete Confirmation */}
      {/* Modal Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300 ${deleteConfirmationOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={closeDeleteConfirmation}
      />
      
      {/* Modal */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 z-50 w-full max-w-md rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-all duration-500 bg-gradient-to-b from-[#2A303C] to-[#252B38] border border-[#3A4150]/50 text-primary overflow-hidden ${deleteConfirmationOpen ? "opacity-100 -translate-y-1/2" : "opacity-0 -translate-y-[40%] pointer-events-none"}`}
      >
        {/* Decorative accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#ef4444] to-[#f87171]"></div>
        
        <div className="p-6 relative">
          {/* Decorative curved gradient line at bottom - positioned behind content */}
          <div className="absolute bottom-0 left-0 right-0 mx-4 h-12 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
            <svg
              className="w-full"
              height="20"
              viewBox="0 0 400 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path d="M0 10C80 20 180 0 400 10" stroke="url(#redGradient)" strokeWidth="1.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="redGradient" x1="0" y1="10" x2="400" y2="10" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ef4444" />
                  <stop offset="1" stopColor="#f87171" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="text-xl font-semibold tracking-tight text-primary">Delete Collection</h2>
            <button
              onClick={closeDeleteConfirmation}
              className="h-8 w-8 rounded-full hover:bg-[#3A4150]/70 transition-colors duration-200 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-5 relative z-10">
            <p className="text-gray-300 text-sm">
              Are you sure you want to delete <span className="font-semibold text-primary">{collectionToDelete?.title}</span>? This will delete all problems inside as well.
            </p>
            
            {/* Modal Footer */}
            <div className="flex justify-end pt-4">
              <button
                onClick={deleteCollection}
                disabled={isDeletingCollection}
                className={`relative overflow-hidden bg-gradient-to-r from-[#ef4444] to-[#f87171] hover:from-[#dc2626] hover:to-[#ef4444] text-primary shadow-md transition-all duration-200 py-2 px-6 rounded-md ${isDeletingCollection ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isDeletingCollection ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary inline-block"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
                <span className="absolute inset-0 w-full h-full bg-primary/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
  
      {/* Toast Notifications */}
      <Toast message={toastMessage} isVisible={isToastVisible} />
    </>
  );
};

export default CollectionCards;

