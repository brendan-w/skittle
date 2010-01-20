#ifndef NUC_DISP
#define NUC_DISP

#include <GL/glut.h>
#include <math.h>
#include <stdlib.h>
#include <string>
#include <vector>

#include <QGLWidget>
#include "BasicTypes.h"
#include "AbstractGraph.h"
#include "MainWindow.h"
#include "TextureCanvas.h"
#include "AlignmentDisplay.h"

using namespace std;

class NucleotideDisplay : public AbstractGraph 
{
	Q_OBJECT

public:
	vector<color> nucleotide_colors;
	bool texture_optimization;
	bool invert;
	bool C;
	bool G;
	bool A;
	bool T;	
	
	NucleotideDisplay(UiVariables* gui, GLWidget* gl);
	~NucleotideDisplay();
	void createConnections();
	void display();
	GLuint render();
	void load_nucleotide();
	void color_compress();
	
	inline int actualWidth()
	{
		return scale * width();
	}
	
	
public slots:	
	void changeWidth(int w);
	void mouseClick(point2D pt);
	
signals:

private:
	GLuint display_object;
	TextureCanvas* textureBuffer;
};

#endif
