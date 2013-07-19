// Created: 04/13/2006
// Updated: 04/13/2006

// annotation canvas
// Keeps track of all information related to the main drawing canvas.
function canvas() {
    
    // *******************************************
    // Private variables:
    // *******************************************
    
    this.annotations; // includes name, deleted, verified info
    
    // *******************************************
    // Public methods:
    // *******************************************
    
    // Returns all of the annotations as an array.
    this.GetAnnotations = function () {
        return this.annotations;
    };
    
    // Allocates an array to hold 'num' annotations.
    this.CreateNewAnnotations = function (num) {
        this.annotations = Array(num);
    };

    // Loop through all of the annotations and draw the polygons.
    this.DrawAllPolygons = function () {
      for(var pp=0; pp < this.annotations.length; pp++) {
	var isDeleted = this.annotations[pp].GetDeleted();
	if(((pp<num_orig_anno)&&((view_Existing&&!isDeleted)||(isDeleted&&view_Deleted))) || (pp>=num_orig_anno)) {
	  this.annotations[pp].DrawPolygon(main_image.GetImRatio());
          
	  // *****************************************
	  this.annotations[pp].SetAttribute('onmousedown','main_handler.RestToSelected(' + pp + ',evt); return false;');
	  this.annotations[pp].SetAttribute('onmousemove','main_handler.CanvasMouseMove(evt,'+ pp +'); return false;');
	  this.annotations[pp].SetAttribute('oncontextmenu','return false');
	  this.annotations[pp].SetAttribute('style','cursor:pointer;');
	  // *****************************************
	}
      }
    };
    
    // Loop through all of the annotations and clear them from the canvas.
    this.ClearAllAnnotations = function () {
        for(var i=0;i<this.annotations.length;i++) {
            this.annotations[i].DeletePolygon();
        }
    };
    
    // Deletes the currently selected polygon from the canvas.
    this.DeleteSelectedPolygon = function () {
        if(selected_poly == -1) return;
        var idx = selected_poly;
        
        if((IsUserAnonymous() || (!IsCreator(this.annotations[idx].GetUsername()))) && (!IsUserAdmin()) && (idx<num_orig_anno) && !action_DeleteExistingObjects) {
            alert('You do not have permission to delete this polygon');
            return;
        }
        
        if(this.annotations[idx].GetVerified()) {
            main_handler.RestToSelected(idx,null);
            return;
        }
        
        if(idx>=num_orig_anno) {
            anno_count--;
            setCookie('counter',anno_count);
            UpdateCounterHTML();
        }
        
        unselectObjects();
        if(view_ObjList) {
            RemoveAnnotationList();
            LoadAnnotationList();
        }
        
        submission_edited = 0;
        old_name = this.annotations[idx].GetObjName();
        new_name = this.annotations[idx].GetObjName();
        
        // Write to logfile:
        WriteLogMsg('*Deleting_object');
        InsertServerLogData('cpts_not_modified');
        
        // Set <deleted> in LM_xml:
        $(LM_xml).children("annotation").children("object").eq(idx).children("deleted").text('1');
        
        // Write XML to server:
        WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
        
        //     SubmitAnnotations(0);
        
        this.annotations[idx].DeletePolygon();
    };
    
    // Add a new annotation to the canvas.
    this.AddAnnotation = function (anno) {
        this.annotations.push(anno);
        this.AttachAnnotation(anno);
    };
    
    // Attach the annotation to the canvas.
    this.AttachAnnotation = function (anno) {
        if(anno.GetDeleted()&&(!view_Deleted)) return;
        var im_ratio = main_image.GetImRatio();
        anno.SetDivAttach('myCanvas_bg');
        anno.DrawPolygon(im_ratio);
        
        // *****************************************
        var anno_id = anno.GetAnnoID();
        anno.SetAttribute('onmousedown','main_handler.RestToSelected(' + anno_id + ',evt); return false;');
        anno.SetAttribute('onmousemove','main_handler.CanvasMouseMove(evt,' + anno_id + ');');
        anno.SetAttribute('oncontextmenu','return false');
        anno.SetAttribute('style','cursor:pointer;');
        // *****************************************
    };
    
    // Detach annotation from the canvas.
    this.DetachAnnotation = function(anno_id) {
        var anno = this.annotations[anno_id];
        anno.DeletePolygon();
        return anno;
    };
}
